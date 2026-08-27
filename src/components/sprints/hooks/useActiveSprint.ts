"use client";

import { useMemo, useState } from "react";
import {
  groupTasks,
  toDateInputValue,
  toUpdateBody,
} from "@/components/tasks/helpers";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
import type { RecordId, Sprint, Task } from "@/shared/types";
import { pickActiveSprint } from "../helpers";

const PAGE_LIMIT = 50;
const REMAINING_LIMIT = 5;

const flattenTasks = (tasks: Task[]): Task[] =>
  groupTasks(tasks).flatMap(({ task, children }) => [task, ...children]);

export function useActiveSprint(sprints: Sprint[], selectedDate: string) {
  const { useTasksList, updateTask } = useTasksApi();
  const sprint = pickActiveSprint(sprints);

  const [addTasksOpen, setAddTasksOpen] = useState(false);
  const [pendingId, setPendingId] = useState<RecordId | null>(null);
  const [actionError, setActionError] = useState("");

  const tasksQuery = useTasksList(
    { page: 1, limit: PAGE_LIMIT, sprint_id: sprint?._id },
    !!sprint,
  );

  const flatTasks = useMemo(
    () => flattenTasks(tasksQuery.data?.items ?? []),
    [tasksQuery.data?.items],
  );

  const progress = useMemo(() => {
    const actionable = flatTasks.filter((task) => task.status !== "cancelled");
    const done = actionable.filter((task) => task.status === "done").length;
    const total = actionable.length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return {
      done,
      total,
      percent,
      complete: total > 0 && done === total,
    };
  }, [flatTasks]);

  const remaining = useMemo(() => {
    const items = flatTasks.filter((task) => {
      if (task.status === "done" || task.status === "cancelled") return false;
      return toDateInputValue(task.doing_date) !== selectedDate;
    });
    return {
      items: items.slice(0, REMAINING_LIMIT),
      extra: Math.max(0, items.length - REMAINING_LIMIT),
    };
  }, [flatTasks, selectedDate]);

  const isLoading = !!sprint && tasksQuery.isLoading;
  const isError = !!sprint && tasksQuery.isError;

  const openAddTasks = () => setAddTasksOpen(true);
  const closeAddTasks = () => setAddTasksOpen(false);

  const scheduleForDay = async (task: Task) => {
    if (pendingId) return;
    setActionError("");
    setPendingId(task._id);
    try {
      await updateTask(task._id, {
        ...toUpdateBody(task),
        doing_date: selectedDate,
      });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not schedule this task."));
    } finally {
      setPendingId(null);
    }
  };

  return {
    sprint,
    progress,
    remaining,
    isLoading,
    isError,
    addTasksOpen,
    pendingId,
    actionError,
    openAddTasks,
    closeAddTasks,
    scheduleForDay,
  };
}

export type ActiveSprintViewModel = ReturnType<typeof useActiveSprint>;
