"use client";

import { useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
import type { RecordId, Task } from "@/shared/types";

const PAGE_LIMIT = 100;

const flattenTasks = (tasks: Task[]): Task[] => {
  const seen = new Set<RecordId>();
  const result: Task[] = [];

  const visit = (task: Task) => {
    if (seen.has(task._id)) return;
    seen.add(task._id);
    result.push(task);
    for (const child of task.children ?? []) visit(child);
  };

  for (const task of tasks) visit(task);
  return result;
};

const matchesSearch = (task: Task, query: string): boolean => {
  if (!query) return true;
  const number = String(task.task_number);
  return (
    task.title.toLowerCase().includes(query) ||
    number.includes(query) ||
    `#${number}`.includes(query)
  );
};

export function useAddTasksToSprint(
  sprintId: RecordId,
  onClose: () => void,
) {
  const { useTasksList, assignToSprint, isAssigning } = useTasksApi();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<RecordId>>(new Set());
  const [error, setError] = useState("");

  const tasksQuery = useTasksList({
    page: 1,
    limit: PAGE_LIMIT,
    doing_date: "null",
    sprint_id: "null",
    status: "todo",
  });
  const listTotal = tasksQuery.data?.total ?? 0;

  const available = useMemo(
    () =>
      flattenTasks(tasksQuery.data?.items ?? []).filter(
        (task) =>
          task.status === "todo" && !task.sprint_id && !task.doing_date,
      ),
    [tasksQuery.data?.items],
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

  const isLoading = tasksQuery.isLoading;
  const isError = tasksQuery.isError;
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

  const onSubmit = async () => {
    if (selectedCount === 0 || isAssigning) return;
    setError("");

    try {
      await assignToSprint({
        task_ids: [...selectedIds],
        sprint_id: sprintId,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not add tasks to this sprint."));
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
    pending: isAssigning,
    error,
    toggle,
    toggleAllVisible,
    onSubmit,
  };
}

export type AddTasksToSprintViewModel = ReturnType<typeof useAddTasksToSprint>;
