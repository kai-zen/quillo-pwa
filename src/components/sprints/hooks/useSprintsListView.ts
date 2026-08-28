"use client";

import { useState } from "react";
import { useGoalsApi, useSprintsApi } from "@/shared/hooks";
import type { Goal, Sprint, SprintListQuery, SprintStatus } from "@/shared/types";
import type { SprintFormMode } from "../form/SprintForm";

const PAGE_LIMIT = 50;

export function useSprintsListView() {
  const { useSprintsList } = useSprintsApi();
  const { useGoalsList } = useGoalsApi();

  const [statusFilter, setStatusFilter] = useState<SprintStatus | "">("");
  const [page, setPage] = useState(1);
  const [sprintFormMode, setSprintFormMode] = useState<SprintFormMode | null>(
    null,
  );

  const listQuery: SprintListQuery = {
    page,
    limit: PAGE_LIMIT,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const sprintsQuery = useSprintsList(listQuery);
  const goalsQuery = useGoalsList({ page: 1, limit: 100 });
  const sprints: Sprint[] = sprintsQuery.data?.items ?? [];
  const goals: Goal[] = goalsQuery.data?.items ?? [];
  const total = sprintsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isLoading = sprintsQuery.isLoading;
  const isError = sprintsQuery.isError;
  const isEmpty = !isLoading && !isError && sprints.length === 0;
  const isFetching = sprintsQuery.isFetching;

  const openCreateSprint = () => setSprintFormMode({ type: "create" });
  const closeSprintForm = () => setSprintFormMode(null);
  const onSprintSaved = () => setSprintFormMode(null);

  const setStatusFilterAndResetPage = (status: SprintStatus | "") => {
    setStatusFilter(status);
    setPage(1);
  };

  return {
    statusFilter,
    setStatusFilterAndResetPage,
    page,
    setPage,
    sprintFormMode,
    sprints,
    goals,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateSprint,
    closeSprintForm,
    onSprintSaved,
  };
}

export type SprintsListViewModel = ReturnType<typeof useSprintsListView>;
