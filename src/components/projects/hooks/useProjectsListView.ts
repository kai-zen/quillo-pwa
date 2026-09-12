"use client";

import { useState } from "react";
import { useProjectsApi } from "@/shared/hooks";
import type { ProjectListQuery, ProjectStatus } from "@/shared/types";
import type { ProjectFormMode } from "../form/ProjectForm";

const PAGE_LIMIT = 50;

export function useProjectsListView() {
  const { useProjectsList } = useProjectsApi();
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");
  const [page, setPage] = useState(1);
  const [projectFormMode, setProjectFormMode] =
    useState<ProjectFormMode | null>(null);
  const query: ProjectListQuery = {
    page,
    limit: PAGE_LIMIT,
    ...(statusFilter ? { status: statusFilter } : {}),
  };
  const projectsQuery = useProjectsList(query);
  const projects = projectsQuery.data?.items ?? [];
  const total = projectsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  return {
    statusFilter,
    setStatusFilterAndResetPage: (status: ProjectStatus | "") => {
      setStatusFilter(status);
      setPage(1);
    },
    page,
    setPage,
    projectFormMode,
    projects,
    total,
    totalPages,
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    isFetching: projectsQuery.isFetching,
    isEmpty:
      !projectsQuery.isLoading &&
      !projectsQuery.isError &&
      projects.length === 0,
    openCreateProject: () => setProjectFormMode({ type: "create" }),
    closeProjectForm: () => setProjectFormMode(null),
    onProjectSaved: () => setProjectFormMode(null),
  };
}

export type ProjectsListViewModel = ReturnType<typeof useProjectsListView>;
