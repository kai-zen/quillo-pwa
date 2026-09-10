"use client";

import { useState } from "react";
import { useProgressesApi } from "@/shared/hooks";
import type { Progress, ProgressListQuery } from "@/shared/types";
import { ProgressFormMode } from "../form/useProgressForm";

const PAGE_LIMIT = 50;

export function useProgressesListView() {
  const { useProgressesList } = useProgressesApi();

  const [page, setPage] = useState(1);
  const [progressFormMode, setProgressFormMode] =
    useState<ProgressFormMode | null>(null);

  const listQuery: ProgressListQuery = {
    page,
    limit: PAGE_LIMIT,
  };

  const progressesQuery = useProgressesList(listQuery);
  const progresses: Progress[] = progressesQuery.data?.items ?? [];
  const total = progressesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isLoading = progressesQuery.isLoading;
  const isError = progressesQuery.isError;
  const isEmpty = !isLoading && !isError && progresses.length === 0;
  const isFetching = progressesQuery.isFetching;

  const openCreateProgress = () => setProgressFormMode({ type: "create" });
  const openEditProgress = (progress: Progress) =>
    setProgressFormMode({ type: "edit", progress });
  const closeProgressForm = () => setProgressFormMode(null);
  const onProgressSaved = () => setProgressFormMode(null);

  return {
    page,
    setPage,
    progressFormMode,
    progresses,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateProgress,
    openEditProgress,
    closeProgressForm,
    onProgressSaved,
  };
}

export type ProgressesListViewModel = ReturnType<typeof useProgressesListView>;
