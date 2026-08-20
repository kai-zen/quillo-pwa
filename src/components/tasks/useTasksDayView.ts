"use client";

import { useState } from "react";
import { useLabelsApi, useSprintsApi, useTasksApi } from "@/shared/hooks";
import type { Label, Sprint, Task } from "@/shared/types";
import type { TaskFormMode } from "./form/TaskForm";
import { buildDayStrip, todayIso } from "./helpers";

const PAGE_LIMIT = 50;

export function useTasksDayView() {
  const { useTasksList } = useTasksApi();
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [stripCenter, setStripCenter] = useState(todayIso);
  const [formMode, setFormMode] = useState<TaskFormMode | null>(null);

  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const tasksQuery = useTasksList({
    page: 1,
    limit: PAGE_LIMIT,
    doing_date: selectedDate,
  });

  const labels: Label[] = labelsQuery.data?.items ?? [];
  const sprints: Sprint[] = sprintsQuery.data?.items ?? [];
  const tasks = tasksQuery.data?.items ?? [];
  const taskTotal = tasksQuery.data?.total ?? 0;

  const isLoading =
    tasksQuery.isLoading || labelsQuery.isLoading || sprintsQuery.isLoading;
  const isError = tasksQuery.isError;
  const isEmpty = !isLoading && !isError && tasks.length === 0;

  const selectDate = (iso: string) => {
    if (!iso) return;
    setSelectedDate(iso);
  };

  const jumpToDate = (iso: string) => {
    if (!iso) return;
    setSelectedDate(iso);
    if (!buildDayStrip(stripCenter).includes(iso)) {
      setStripCenter(iso);
    }
  };

  const openCreate = (parent?: Task) => {
    setFormMode({
      type: "create",
      parentId: parent?._id ?? null,
      parentTitle: parent?.title,
      doingDate: selectedDate,
    });
  };

  const openEdit = (task: Task) => setFormMode({ type: "edit", task });
  const closeForm = () => setFormMode(null);

  return {
    selectedDate,
    stripCenter,
    selectDate,
    jumpToDate,
    formMode,
    labels,
    sprints,
    tasks,
    taskTotal,
    isLoading,
    isError,
    isEmpty,
    openCreate,
    openEdit,
    closeForm,
  };
}

export type TasksDayViewModel = ReturnType<typeof useTasksDayView>;
