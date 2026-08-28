"use client";

import { useState } from "react";
import { useGoalsApi } from "@/shared/hooks";
import type { Goal, GoalListQuery, GoalStatus } from "@/shared/types";
import type { GoalFormMode } from "../form/GoalForm";

const PAGE_LIMIT = 50;

export function useGoalsListView() {
  const { useGoalsList } = useGoalsApi();

  const [statusFilter, setStatusFilter] = useState<GoalStatus | "">("");
  const [page, setPage] = useState(1);
  const [goalFormMode, setGoalFormMode] = useState<GoalFormMode | null>(null);

  const listQuery: GoalListQuery = {
    page,
    limit: PAGE_LIMIT,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const goalsQuery = useGoalsList(listQuery);
  const goals: Goal[] = goalsQuery.data?.items ?? [];
  const total = goalsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isLoading = goalsQuery.isLoading;
  const isError = goalsQuery.isError;
  const isEmpty = !isLoading && !isError && goals.length === 0;
  const isFetching = goalsQuery.isFetching;

  const openCreateGoal = () => setGoalFormMode({ type: "create" });
  const closeGoalForm = () => setGoalFormMode(null);
  const onGoalSaved = () => setGoalFormMode(null);

  const setStatusFilterAndResetPage = (status: GoalStatus | "") => {
    setStatusFilter(status);
    setPage(1);
  };

  return {
    statusFilter,
    setStatusFilterAndResetPage,
    page,
    setPage,
    goalFormMode,
    goals,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateGoal,
    closeGoalForm,
    onGoalSaved,
  };
}

export type GoalsListViewModel = ReturnType<typeof useGoalsListView>;
