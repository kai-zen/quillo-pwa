"use client";

import { useState } from "react";
import { useLabelsApi, useRoutinesApi } from "@/shared/hooks";
import type { DayOfWeek, Label, Routine, RoutineListQuery } from "@/shared/types";
import type { RoutineFormMode } from "../form/RoutineForm";

const PAGE_LIMIT = 50;

export function useRoutinesListView() {
  const { useRoutinesList } = useRoutinesApi();
  const { useLabelsList } = useLabelsApi();

  const [dayFilter, setDayFilter] = useState<DayOfWeek | "">("");
  const [page, setPage] = useState(1);
  const [routineFormMode, setRoutineFormMode] = useState<RoutineFormMode | null>(
    null,
  );

  const listQuery: RoutineListQuery = {
    page,
    limit: PAGE_LIMIT,
    ...(dayFilter ? { day: dayFilter } : {}),
  };

  const routinesQuery = useRoutinesList(listQuery);
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });

  const routines: Routine[] = routinesQuery.data?.items ?? [];
  const labels: Label[] = labelsQuery.data?.items ?? [];
  const total = routinesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isLoading = routinesQuery.isLoading;
  const isError = routinesQuery.isError;
  const isEmpty = !isLoading && !isError && routines.length === 0;
  const isFetching = routinesQuery.isFetching;

  const openCreateRoutine = () => setRoutineFormMode({ type: "create" });
  const openEditRoutine = (routine: Routine) =>
    setRoutineFormMode({ type: "edit", routine });
  const closeRoutineForm = () => setRoutineFormMode(null);
  const onRoutineSaved = () => setRoutineFormMode(null);

  const setDayFilterAndResetPage = (day: DayOfWeek | "") => {
    setDayFilter(day);
    setPage(1);
  };

  return {
    dayFilter,
    setDayFilterAndResetPage,
    page,
    setPage,
    routineFormMode,
    routines,
    labels,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateRoutine,
    openEditRoutine,
    closeRoutineForm,
    onRoutineSaved,
  };
}

export type RoutinesListViewModel = ReturnType<typeof useRoutinesListView>;
