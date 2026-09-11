"use client";

import { useState } from "react";
import { useDailyReviewsApi } from "@/shared/hooks";
import type { DailyReview } from "@/shared/types";
import { toIsoDay } from "./helpers";

const PAGE_LIMIT = 10;

export function useJournalView() {
  const { useDailyReviewsList } = useDailyReviewsApi();
  const [page, setPage] = useState(1);

  const query = useDailyReviewsList({ page, limit: PAGE_LIMIT });
  const entries: DailyReview[] = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isLoading = query.isLoading;
  const isError = query.isError;
  const isEmpty = !isLoading && !isError && entries.length === 0;
  const isFetching = query.isFetching;

  const [readingDate, setReadingDate] = useState<string | null>(null);
  const openEntry = (entry: DailyReview) =>
    setReadingDate(toIsoDay(entry.date));
  const closeEntry = () => setReadingDate(null);

  return {
    page,
    setPage,
    total,
    totalPages,
    entries,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    readingDate,
    openEntry,
    closeEntry,
  };
}

export type JournalViewModel = ReturnType<typeof useJournalView>;
