"use client";

import { useTasksApi } from "@/shared/hooks";

const PAGE_LIMIT = 50;

export function useDayTasksForDate(doingDate: string) {
  const query = useTasksApi().useTasksList({
    page: 1,
    limit: PAGE_LIMIT,
    doing_date: doingDate,
  });

  return {
    tasks: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
