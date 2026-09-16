"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TaskFormMode } from "@/components/tasks/form/TaskForm";
import { toUpdateBody as toTaskUpdateBody } from "@/components/tasks/helpers";
import { getErrorMessage } from "@/shared/errors";
import {
  useLabelsApi,
  useProjectsApi,
  useSprintsApi,
  useTasksApi,
} from "@/shared/hooks";
import type { Project, RecordId, Task, TaskStatus } from "@/shared/types";
import type { ProjectFormMode } from "../form/ProjectForm";

const PAGE_LIMIT = 50;

export function useProjectDetail(projectId: RecordId) {
  const router = useRouter();
  const { useProject, useProjectsList } = useProjectsApi();
  const { useTasksList, updateTask } = useTasksApi();
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();
  const [page, setPage] = useState(1);
  const [taskView, setTaskView] = useState<"table" | "board">("table");
  const [projectFormMode, setProjectFormMode] =
    useState<ProjectFormMode | null>(null);
  const [taskFormMode, setTaskFormMode] = useState<TaskFormMode | null>(null);
  const [addTasksOpen, setAddTasksOpen] = useState(false);
  const [pendingId, setPendingId] = useState<RecordId | null>(null);
  const [actionError, setActionError] = useState("");

  const projectQuery = useProject(projectId);
  const tasksQuery = useTasksList(
    { page, limit: PAGE_LIMIT, project_id: projectId },
    !!projectId,
  );
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const projectsQuery = useProjectsList({ page: 1, limit: 250 });
  const project = projectQuery.data ?? null;
  const tasks = tasksQuery.data?.items ?? [];
  const taskTotal = tasksQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(taskTotal / PAGE_LIMIT));

  const openCreateTask = (parent?: Task) => {
    setActionError("");

    const projectId: RecordId | null =
      (parent?.project_id as Project)?._id ||
      (parent?.project_id as string) ||
      null;

    setTaskFormMode({
      type: "create",
      parentId: parent?._id ?? null,
      parentTitle: parent?.title,
      sprintId: parent?.sprint_id,
      doingDate: parent?.doing_date,
      projectId,
    });
  };
  const changeTaskStatus = async (task: Task, status: TaskStatus) => {
    if (pendingId || task.status === status) return;
    setActionError("");
    setPendingId(task._id);
    try {
      await updateTask(task._id, { ...toTaskUpdateBody(task), status });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update task status."));
    } finally {
      setPendingId(null);
    }
  };

  return {
    projectId,
    project,
    tasks,
    taskTotal,
    page,
    setPage,
    totalPages,
    taskView,
    setTaskView,
    labels: labelsQuery.data?.items ?? [],
    sprints: sprintsQuery.data?.items ?? [],
    projects: projectsQuery.data?.items ?? [],
    projectsTruncated:
      (projectsQuery.data?.total ?? 0) >
      (projectsQuery.data?.items.length ?? 0),
    projectFormMode,
    taskFormMode,
    addTasksOpen,
    pendingId,
    actionError,
    isProjectLoading: projectQuery.isLoading,
    isProjectError: projectQuery.isError,
    isProjectMissing:
      !projectQuery.isLoading && !projectQuery.isError && !project,
    isTasksLoading: tasksQuery.isLoading || labelsQuery.isLoading,
    isTasksError: tasksQuery.isError,
    isTasksFetching: tasksQuery.isFetching,
    isTasksEmpty:
      !tasksQuery.isLoading && !tasksQuery.isError && tasks.length === 0,
    openEditProject: () =>
      project && setProjectFormMode({ type: "edit", project }),
    closeProjectForm: () => setProjectFormMode(null),
    onProjectSaved: (result?: { deleted?: boolean }) => {
      setProjectFormMode(null);
      if (result?.deleted) router.push("/projects");
    },
    openCreateTask,
    openEditTask: (task: Task) => {
      setActionError("");
      setTaskFormMode({ type: "edit", task });
    },
    closeTaskForm: () => setTaskFormMode(null),
    openAddTasks: () => {
      setActionError("");
      setAddTasksOpen(true);
    },
    closeAddTasks: () => setAddTasksOpen(false),
    changeTaskStatus,
  };
}

export type ProjectDetailViewModel = ReturnType<typeof useProjectDetail>;
