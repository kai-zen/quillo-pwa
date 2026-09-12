"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TaskFormMode } from "@/components/tasks/form/TaskForm";
import { toUpdateBody as toTaskUpdateBody } from "@/components/tasks/helpers";
import { getErrorMessage } from "@/shared/errors";
import {
  useGoalsApi,
  useLabelsApi,
  useProjectsApi,
  useProgressesApi,
  useSprintsApi,
  useTasksApi,
} from "@/shared/hooks";
import type {
  Goal,
  Label,
  Progress,
  Project,
  RecordId,
  Sprint,
  Task,
  TaskStatus,
} from "@/shared/types";
import type { SprintFormMode } from "../form/SprintForm";
import {
  findGoal,
  findProgresses,
  toUpdateBody as toSprintUpdateBody,
} from "../helpers";

const PAGE_LIMIT = 50;

export function useSprintDetail(sprintId: RecordId) {
  const router = useRouter();
  const { useSprint, useSprintsList, updateSprint } = useSprintsApi();
  const { useGoalsList } = useGoalsApi();
  const { useProgressesList } = useProgressesApi();
  const { useTasksList, updateTask } = useTasksApi();
  const { useLabelsList } = useLabelsApi();
  const { useProjectsList } = useProjectsApi();

  const [sprintFormMode, setSprintFormMode] = useState<SprintFormMode | null>(
    null,
  );
  const [taskFormMode, setTaskFormMode] = useState<TaskFormMode | null>(null);
  const [addTasksOpen, setAddTasksOpen] = useState(false);
  const [addProgressOpen, setAddProgressOpen] = useState(false);
  const [pendingId, setPendingId] = useState<RecordId | null>(null);
  const [actionError, setActionError] = useState("");

  const sprintQuery = useSprint(sprintId);
  const catalogQuery = useSprintsList({ page: 1, limit: 100 });
  const goalsQuery = useGoalsList({ page: 1, limit: 100 });
  const progressesQuery = useProgressesList({ page: 1, limit: 100 });
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const projectsQuery = useProjectsList({ page: 1, limit: 250 });
  const tasksQuery = useTasksList(
    { page: 1, limit: PAGE_LIMIT, sprint_id: sprintId },
    !!sprintId,
  );

  const sprint: Sprint | null = sprintQuery.data ?? null;
  const catalog: Sprint[] = catalogQuery.data?.items ?? [];
  const goals: Goal[] = goalsQuery.data?.items ?? [];
  const linkedGoal = sprint ? findGoal(sprint.goal_id, goals) : null;
  const progresses: Progress[] = progressesQuery.data?.items ?? [];
  const linkedProgresses = sprint
    ? findProgresses(sprint.progress_ids, progresses)
    : [];
  const labels: Label[] = labelsQuery.data?.items ?? [];
  const projects: Project[] = projectsQuery.data?.items ?? [];
  const tasks = tasksQuery.data?.items ?? [];
  const taskTotal = tasksQuery.data?.total ?? 0;

  const isSprintLoading = sprintQuery.isLoading;
  const isSprintError = sprintQuery.isError;
  const isSprintMissing = !isSprintLoading && !isSprintError && !sprint;

  const isTasksLoading = tasksQuery.isLoading || labelsQuery.isLoading;
  const isTasksError = tasksQuery.isError;
  const isTasksEmpty = !isTasksLoading && !isTasksError && tasks.length === 0;

  const linkedProgressCount = sprint?.progress_ids?.length ?? 0;
  const isProgressesLoading =
    linkedProgressCount > 0 && progressesQuery.isLoading;
  const isProgressesError = linkedProgressCount > 0 && progressesQuery.isError;

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
      projectId: parent?.project_id ?? null,
    });
  };

  const openEditTask = (task: Task) => setTaskFormMode({ type: "edit", task });
  const closeTaskForm = () => setTaskFormMode(null);
  const openAddTasks = () => setAddTasksOpen(true);
  const closeAddTasks = () => setAddTasksOpen(false);
  const openAddProgress = () => setAddProgressOpen(true);
  const closeAddProgress = () => setAddProgressOpen(false);

  const removeProgress = async (progress: Progress) => {
    if (!sprint || pendingId) return;
    setActionError("");
    setPendingId(progress._id);
    try {
      await updateSprint(sprint._id, {
        ...toSprintUpdateBody(sprint),
        progress_ids: (sprint.progress_ids ?? []).filter(
          (id) => id !== progress._id,
        ),
      });
    } catch (err) {
      setActionError(
        getErrorMessage(err, "Could not remove progress from this sprint."),
      );
    } finally {
      setPendingId(null);
    }
  };

  const changeTaskStatus = async (task: Task, status: TaskStatus) => {
    if (pendingId || task.status === status) return;
    setActionError("");
    setPendingId(task._id);
    try {
      await updateTask(task._id, {
        ...toTaskUpdateBody(task),
        status,
      });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update task status."));
    } finally {
      setPendingId(null);
    }
  };

  return {
    sprintId,
    sprint,
    linkedGoal,
    linkedProgresses,
    sprintFormMode,
    taskFormMode,
    addTasksOpen,
    addProgressOpen,
    catalog,
    labels,
    projects,
    tasks,
    taskTotal,
    isSprintLoading,
    isSprintError,
    isSprintMissing,
    isTasksLoading,
    isTasksError,
    isTasksEmpty,
    isProgressesLoading,
    isProgressesError,
    pendingId,
    actionError,
    openEditSprint,
    closeSprintForm,
    onSprintSaved,
    openCreateTask,
    openEditTask,
    closeTaskForm,
    openAddTasks,
    closeAddTasks,
    openAddProgress,
    closeAddProgress,
    removeProgress,
    changeTaskStatus,
  };
}

export type SprintDetailViewModel = ReturnType<typeof useSprintDetail>;
