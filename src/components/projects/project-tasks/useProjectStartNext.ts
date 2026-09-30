"use client";

import { useQueries } from "@tanstack/react-query";
import { request, tasksModule } from "@/shared/endpoints";
import { queryKeys, useTasksApi } from "@/shared/hooks";
import type { RecordId, Task } from "@/shared/types";
import {
  buildStartQuadrants,
  projectTaskQuery,
  type ProjectTaskFilters,
  type StartQuadrant,
} from "./helpers";

const FETCH_LIMIT = 250;
const MAX_PAGES = 8;

export function useProjectStartNext(
  projectId: RecordId,
  filters: ProjectTaskFilters,
  enabled: boolean,
) {
  const { useTasksList } = useTasksApi();
  const first = useTasksList(
    projectTaskQuery(projectId, "todo", 1, FETCH_LIMIT, filters),
    enabled,
  );
  const total = first.data?.total ?? 0;
  const pageCount = Math.min(MAX_PAGES, Math.ceil(total / FETCH_LIMIT));

  const rest = useQueries({
    queries: Array.from({ length: MAX_PAGES - 1 }, (_, index) => {
      const page = index + 2;
      const query = projectTaskQuery(
        projectId,
        "todo",
        page,
        FETCH_LIMIT,
        filters,
      );
      return {
        queryKey: queryKeys.tasks.list(query),
        queryFn: () => request(tasksModule.list, { query }),
        enabled: enabled && page <= pageCount,
      };
    }),
  });

  const pagesPending =
    first.isPending ||
    rest.some((query, index) => index + 2 <= pageCount && query.isPending);
  const isLoading = enabled && pagesPending;
  const isError =
    first.isError ||
    rest.some((query, index) => index + 2 <= pageCount && query.isError);

  const tasks: Task[] = [];
  const seen = new Set<string>();
  const push = (items?: Task[]) => {
    for (const task of items ?? []) {
      if (seen.has(task._id)) continue;
      seen.add(task._id);
      tasks.push(task);
    }
  };
  push(first.data?.items);
  for (const query of rest) push(query.data?.items);

  const quadrants: StartQuadrant[] = buildStartQuadrants(tasks, filters);

  return {
    quadrants,
    isLoading,
    isError,
    isFetching: first.isFetching || rest.some((query) => query.isFetching),
    truncated: total > MAX_PAGES * FETCH_LIMIT,
    todoTotal: total,
  };
}
