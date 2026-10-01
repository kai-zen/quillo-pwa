"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";
import { getErrorMessage } from "@/shared/errors";
import {
  queryKeys,
  useDailySectionsApi,
  useTasksApi,
} from "@/shared/hooks";
import type {
  DailySection,
  PaginatedResponse,
  Task,
  TaskListQuery,
} from "@/shared/types";
import {
  dayItemId,
  splitUnifiedOrder,
} from "./dayScheduleHelpers";

const PAGE_LIMIT = 50;

export function useDayScheduleReorder(date: string) {
  const queryClient = useQueryClient();
  const { reorderDailySections } = useDailySectionsApi();
  const { sortDailyTasks } = useTasksApi();
  const reorderGen = useRef(0);

  const taskQuery = useMemo<TaskListQuery>(
    () => ({
      page: 1,
      limit: PAGE_LIMIT,
      doing_date: date,
    }),
    [date],
  );

  const reorderDaySchedule = useCallback(
    async (orderedIds: string[]) => {
      if (orderedIds.length < 2) return;

      const { sectionItems, taskItems } = splitUnifiedOrder(orderedIds);
      const orderByCompositeId = new Map(
        orderedIds.map((id, sort_order) => [id, sort_order]),
      );
      const gen = ++reorderGen.current;

      queryClient.setQueryData(
        queryKeys.dailySections.byDate(date),
        (current: { items: DailySection[] } | undefined) => {
          if (!current) return current;
          return {
            ...current,
            items: current.items.map((section) => {
              const sort_order = orderByCompositeId.get(
                dayItemId("section", section._id),
              );
              return sort_order === undefined
                ? section
                : { ...section, sort_order };
            }),
          };
        },
      );

      queryClient.setQueryData(
        queryKeys.tasks.list(taskQuery),
        (current: PaginatedResponse<Task> | undefined) => {
          if (!current) return current;
          return {
            ...current,
            items: current.items.map((task) => {
              const sort_order = orderByCompositeId.get(
                dayItemId("task", task._id),
              );
              return sort_order === undefined ? task : { ...task, sort_order };
            }),
          };
        },
      );

      try {
        await Promise.all([
          sectionItems.length > 0
            ? reorderDailySections({ items: sectionItems })
            : Promise.resolve(),
          taskItems.length > 0
            ? sortDailyTasks({ items: taskItems })
            : Promise.resolve(),
        ]);
      } catch (err) {
        if (gen !== reorderGen.current) return;
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.dailySections.all,
          }),
          queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
        ]);
        throw err;
      }
    },
    [date, queryClient, reorderDailySections, sortDailyTasks, taskQuery],
  );

  const reorderDayScheduleSafe = useCallback(
    async (orderedIds: string[], setError: (message: string) => void) => {
      try {
        await reorderDaySchedule(orderedIds);
      } catch (err) {
        setError(getErrorMessage(err, "Could not save order."));
      }
    },
    [reorderDaySchedule],
  );

  return { reorderDaySchedule, reorderDayScheduleSafe };
}
