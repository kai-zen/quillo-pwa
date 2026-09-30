"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TaskFormMode } from "@/components/tasks/form/TaskForm";
import {
  useLabelsApi,
  useProjectsApi,
  useSprintsApi,
} from "@/shared/hooks";
import type { Project, RecordId, Task } from "@/shared/types";
import type { ProjectFormMode } from "../form/ProjectForm";
import { useProjectTaskBrowser } from "../project-tasks/useProjectTaskBrowser";

export function useProjectDetail(projectId: RecordId) {
  const router = useRouter();
  const { useProject, useProjectsList } = useProjectsApi();
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();
  const [projectFormMode, setProjectFormMode] =
    useState<ProjectFormMode | null>(null);
  const [taskFormMode, setTaskFormMode] = useState<TaskFormMode | null>(null);
  const [addTasksOpen, setAddTasksOpen] = useState(false);
  const taskBrowser = useProjectTaskBrowser(projectId);

  const projectQuery = useProject(projectId);
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const projectsQuery = useProjectsList({ page: 1, limit: 250 });
  const project = projectQuery.data ?? null;

  const openCreateTask = (parent?: Task) => {
    const parentProjectId: RecordId | null =
      (parent?.project_id as Project)?._id ||
      (parent?.project_id as string) ||
      null;

    setTaskFormMode({
      type: "create",
      parentId: parent?._id ?? null,
      parentTitle: parent?.title,
      sprintId: parent?.sprint_id,
      doingDate: parent?.doing_date,
      projectId: parentProjectId ?? projectId,
    });
  };

  return {
    projectId,
    project,
    taskBrowser,
    labels: labelsQuery.data?.items ?? [],
    sprints: sprintsQuery.data?.items ?? [],
    projects: projectsQuery.data?.items ?? [],
    projectsTruncated:
      (projectsQuery.data?.total ?? 0) >
      (projectsQuery.data?.items.length ?? 0),
    projectFormMode,
    taskFormMode,
    addTasksOpen,
    isProjectLoading: projectQuery.isLoading,
    isProjectError: projectQuery.isError,
    isProjectMissing:
      !projectQuery.isLoading && !projectQuery.isError && !project,
    openEditProject: () =>
      project && setProjectFormMode({ type: "edit", project }),
    closeProjectForm: () => setProjectFormMode(null),
    onProjectSaved: (result?: { deleted?: boolean }) => {
      setProjectFormMode(null);
      if (result?.deleted) router.push("/projects");
    },
    openCreateTask,
    openEditTask: (task: Task) => {
      setTaskFormMode({ type: "edit", task });
    },
    closeTaskForm: () => setTaskFormMode(null),
    openAddTasks: () => {
      setAddTasksOpen(true);
    },
    closeAddTasks: () => setAddTasksOpen(false),
  };
}

export type ProjectDetailViewModel = ReturnType<typeof useProjectDetail>;
