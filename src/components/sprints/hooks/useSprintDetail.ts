"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TaskFormMode } from "@/components/tasks/form/TaskForm";
import { useLabelsApi, useSprintsApi, useTasksApi } from "@/shared/hooks";
import type { Label, RecordId, Sprint, Task } from "@/shared/types";
import type { SprintFormMode } from "../form/SprintForm";

const PAGE_LIMIT = 50;

export function useSprintDetail(sprintId: RecordId) {
  const router = useRouter();
  const { useSprint, useSprintsList } = useSprintsApi();
  const { useTasksList } = useTasksApi();
  const { useLabelsList } = useLabelsApi();

  const [sprintFormMode, setSprintFormMode] = useState<SprintFormMode | null>(
    null,
  );
  const [taskFormMode, setTaskFormMode] = useState<TaskFormMode | null>(null);
  const [addTasksOpen, setAddTasksOpen] = useState(false);

  const sprintQuery = useSprint(sprintId);
  const catalogQuery = useSprintsList({ page: 1, limit: 100 });
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const tasksQuery = useTasksList(
    { page: 1, limit: PAGE_LIMIT, sprint_id: sprintId },
    !!sprintId,
  );

  const sprint: Sprint | null = sprintQuery.data ?? null;
  const catalog: Sprint[] = catalogQuery.data?.items ?? [];
  const labels: Label[] = labelsQuery.data?.items ?? [];
  const tasks = tasksQuery.data?.items ?? [];
  const taskTotal = tasksQuery.data?.total ?? 0;

  const isSprintLoading = sprintQuery.isLoading;
  const isSprintError = sprintQuery.isError;
  const isSprintMissing = !isSprintLoading && !isSprintError && !sprint;

  const isTasksLoading = tasksQuery.isLoading || labelsQuery.isLoading;
  const isTasksError = tasksQuery.isError;
  const isTasksEmpty = !isTasksLoading && !isTasksError && tasks.length === 0;

  const openEditSprint = () => {
    if (!sprint) return;
    setSprintFormMode({ type: "edit", sprint });
  };
  const closeSprintForm = () => setSprintFormMode(null);

  const onSprintSaved = (result?: { deleted?: boolean }) => {
    setSprintFormMode(null);
    if (result?.deleted) router.push("/sprints");
  };

  const openCreateTask = (parent?: Task) => {
    setTaskFormMode({
      type: "create",
      parentId: parent?._id ?? null,
      parentTitle: parent?.title,
      sprintId,
    });
  };

  const openEditTask = (task: Task) => setTaskFormMode({ type: "edit", task });
  const closeTaskForm = () => setTaskFormMode(null);
  const openAddTasks = () => setAddTasksOpen(true);
  const closeAddTasks = () => setAddTasksOpen(false);

  return {
    sprintId,
    sprint,
    sprintFormMode,
    taskFormMode,
    addTasksOpen,
    catalog,
    labels,
    tasks,
    taskTotal,
    isSprintLoading,
    isSprintError,
    isSprintMissing,
    isTasksLoading,
    isTasksError,
    isTasksEmpty,
    openEditSprint,
    closeSprintForm,
    onSprintSaved,
    openCreateTask,
    openEditTask,
    closeTaskForm,
    openAddTasks,
    closeAddTasks,
  };
}

export type SprintDetailViewModel = ReturnType<typeof useSprintDetail>;
