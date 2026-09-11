"use client";

import { useMemo, useState } from "react";
import {
  formatDayShort,
  groupTasks,
  toDateInputValue,
  toUpdateBody,
} from "@/components/tasks/helpers";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
import type { RecordId, Task, TaskListQuery } from "@/shared/types";

const PAGE_LIMIT = 100;

export type ScheduleTaskSource = "backlog" | "sprint";

const flattenTasks = (tasks: Task[]): Task[] =>
  groupTasks(tasks).flatMap(({ task, children }) => [task, ...children]);

const matchesSearch = (task: Task, query: string): boolean => {
  if (!query) return true;
  const number = String(task.task_number);
  return (
    task.title.toLowerCase().includes(query) ||
    number.includes(query) ||
    `#${number}`.includes(query)
  );
};

const isSchedulable = (task: Task, doingDate: string): boolean => {
  if (task.status === "done" || task.status === "cancelled") return false;
  return toDateInputValue(task.doing_date) !== doingDate;
};

export function useScheduleExistingTasks(
  doingDate: string,
  source: ScheduleTaskSource,
  sprintId: RecordId | null,
  onClose: () => void,
) {
  const { useTasksList, updateTask, isUpdating } = useTasksApi();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<RecordId>>(new Set());
  const [error, setError] = useState("");

  const listQuery: TaskListQuery = {
    page: 1,
    limit: PAGE_LIMIT,
    ...(source === "backlog"
      ? { doing_date: "null", sprint_id: "null" }
      : { sprint_id: sprintId ?? undefined }),
  };

  const enabled = source === "backlog" || !!sprintId;
  const tasksQuery = useTasksList(listQuery, enabled);
  const listTotal = tasksQuery.data?.total ?? 0;

  const available = useMemo(
    () =>
      flattenTasks(tasksQuery.data?.items ?? []).filter((task) =>
        isSchedulable(task, doingDate),
      ),
    [tasksQuery.data?.items, doingDate],
  );

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () => available.filter((task) => matchesSearch(task, query)),
    [available, query],
  );

  const selectedCount = selectedIds.size;
  const visibleIds = useMemo(
    () => visible.map((task) => task._id),
    [visible],
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const isLoading = enabled && tasksQuery.isLoading;
  const isError = enabled && tasksQuery.isError;
  const isEmpty = !isLoading && !isError && available.length === 0;
  const isFilterEmpty =
    !isLoading && !isError && available.length > 0 && visible.length === 0;
  const isTruncated = listTotal > PAGE_LIMIT;

  const toggle = (id: RecordId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  };

  const scheduleHint = (task: Task): string => {
    const scheduled = toDateInputValue(task.doing_date);
    if (scheduled) return `Scheduled for ${formatDayShort(scheduled)}`;
    return source === "backlog" ? "In backlog" : "Unscheduled in sprint";
  };

  const onSubmit = async () => {
    if (selectedCount === 0 || isUpdating) return;
    setError("");

    const tasksById = new Map(available.map((task) => [task._id, task]));

    try {
      await Promise.all(
        [...selectedIds].map(async (id) => {
          const task = tasksById.get(id);
          if (!task) return;
          await updateTask(id, {
            ...toUpdateBody(task),
            doing_date: doingDate,
          });
        }),
      );
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not schedule these tasks."));
    }
  };

  return {
    search,
    setSearch,
    selectedIds,
    selectedCount,
    visible,
    allVisibleSelected,
    isLoading,
    isError,
    isEmpty,
    isFilterEmpty,
    isTruncated,
    pending: isUpdating,
    error,
    toggle,
    toggleAllVisible,
    scheduleHint,
    onSubmit,
  };
}

export type ScheduleExistingTasksViewModel = ReturnType<
  typeof useScheduleExistingTasks
>;
