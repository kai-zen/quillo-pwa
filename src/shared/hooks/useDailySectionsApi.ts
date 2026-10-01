"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dailySectionsModule, request } from "@/shared/endpoints";
import type {
  CreateDailySectionBody,
  RecordId,
  ReorderDailySectionsBody,
  UpdateDailySectionBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useDailySectionsApi = () => {
  const queryClient = useQueryClient();

  const invalidateDailySections = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.dailySections.all });

  const useDailySectionsByDate = (date: string, enabled = true) =>
    useQuery({
      queryKey: queryKeys.dailySections.byDate(date),
      queryFn: () =>
        request(dailySectionsModule.listByDate, { params: { date } }),
      enabled: enabled && !!date,
    });

  const useDailySection = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.dailySections.detail(id),
      queryFn: () => request(dailySectionsModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createDailySectionMutation = useMutation({
    mutationFn: (body: CreateDailySectionBody) =>
      request(dailySectionsModule.create, { body }),
    onSuccess: invalidateDailySections,
  });

  const updateDailySectionMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: RecordId;
      body: UpdateDailySectionBody;
    }) => request(dailySectionsModule.update, { body, params: { id } }),
    onSuccess: invalidateDailySections,
  });

  const reorderDailySectionsMutation = useMutation({
    mutationFn: (body: ReorderDailySectionsBody) =>
      request(dailySectionsModule.reorder, { body }),
    onSuccess: invalidateDailySections,
  });

  const deleteDailySectionMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(dailySectionsModule.delete, { params: { id } }),
    onSuccess: invalidateDailySections,
  });

  return {
    useDailySectionsByDate,
    useDailySection,
    createDailySection: createDailySectionMutation.mutateAsync,
    updateDailySection: (id: RecordId, body: UpdateDailySectionBody) =>
      updateDailySectionMutation.mutateAsync({ id, body }),
    reorderDailySections: reorderDailySectionsMutation.mutateAsync,
    deleteDailySection: deleteDailySectionMutation.mutateAsync,
    isCreating: createDailySectionMutation.isPending,
    isUpdating: updateDailySectionMutation.isPending,
    isReordering: reorderDailySectionsMutation.isPending,
    isDeleting: deleteDailySectionMutation.isPending,
  };
};
