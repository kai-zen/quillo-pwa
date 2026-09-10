"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { progressesModule, request } from "@/shared/endpoints";
import type {
  CreateProgressBody,
  ProgressListQuery,
  RecordId,
  UpdateProgressBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useProgressesApi = () => {
  const queryClient = useQueryClient();

  const invalidateProgresses = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.progresses.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sprints.all }),
    ]);
  };

  const useProgressesList = (query?: ProgressListQuery) =>
    useQuery({
      queryKey: queryKeys.progresses.list(query),
      queryFn: () => request(progressesModule.list, { query }),
    });

  const useProgress = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.progresses.detail(id),
      queryFn: () => request(progressesModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createProgressMutation = useMutation({
    mutationFn: (body: CreateProgressBody) =>
      request(progressesModule.create, { body }),
    onSuccess: invalidateProgresses,
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ id, body }: { id: RecordId; body: UpdateProgressBody }) =>
      request(progressesModule.update, { body, params: { id } }),
    onSuccess: invalidateProgresses,
  });

  const deleteProgressMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(progressesModule.delete, { params: { id } }),
    onSuccess: invalidateProgresses,
  });

  return {
    useProgressesList,
    useProgress,
    createProgress: createProgressMutation.mutateAsync,
    updateProgress: (id: RecordId, body: UpdateProgressBody) =>
      updateProgressMutation.mutateAsync({ id, body }),
    deleteProgress: deleteProgressMutation.mutateAsync,
    isCreating: createProgressMutation.isPending,
    isUpdating: updateProgressMutation.isPending,
    isDeleting: deleteProgressMutation.isPending,
  };
};
