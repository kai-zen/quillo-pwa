"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { progressInputsModule, request } from "@/shared/endpoints";
import type {
  CreateProgressInputBody,
  ProgressInputListQuery,
  ProgressInputRangeQuery,
  RecordId,
  UpdateProgressInputBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useProgressInputsApi = () => {
  const queryClient = useQueryClient();

  const invalidateProgressInputs = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.progressInputs.all });

  const useProgressInputsList = (query?: ProgressInputListQuery) =>
    useQuery({
      queryKey: queryKeys.progressInputs.list(query),
      queryFn: () => request(progressInputsModule.list, { query }),
    });

  const useProgressInput = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.progressInputs.detail(id),
      queryFn: () => request(progressInputsModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const useProgressInputsByDate = (date: string, enabled = true) =>
    useQuery({
      queryKey: queryKeys.progressInputs.byDate(date),
      queryFn: () =>
        request(progressInputsModule.getByDate, { params: { date } }),
      enabled: enabled && !!date,
    });

  const useProgressInputsRange = (
    query: ProgressInputRangeQuery,
    enabled = true,
  ) =>
    useQuery({
      queryKey: queryKeys.progressInputs.range(query),
      queryFn: () => request(progressInputsModule.getByRange, { query }),
      enabled: enabled && !!query.from && !!query.to,
    });

  const createProgressInputMutation = useMutation({
    mutationFn: (body: CreateProgressInputBody) =>
      request(progressInputsModule.create, { body }),
    onSuccess: invalidateProgressInputs,
  });

  const updateProgressInputMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: RecordId;
      body: UpdateProgressInputBody;
    }) => request(progressInputsModule.update, { body, params: { id } }),
    onSuccess: invalidateProgressInputs,
  });

  const deleteProgressInputMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(progressInputsModule.delete, { params: { id } }),
    onSuccess: invalidateProgressInputs,
  });

  return {
    useProgressInputsList,
    useProgressInput,
    useProgressInputsByDate,
    useProgressInputsRange,
    createProgressInput: createProgressInputMutation.mutateAsync,
    updateProgressInput: (id: RecordId, body: UpdateProgressInputBody) =>
      updateProgressInputMutation.mutateAsync({ id, body }),
    deleteProgressInput: deleteProgressInputMutation.mutateAsync,
    isCreating: createProgressInputMutation.isPending,
    isUpdating: updateProgressInputMutation.isPending,
    isDeleting: deleteProgressInputMutation.isPending,
  };
};
