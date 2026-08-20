"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { labelsModule, request } from "@/shared/endpoints";
import type {
  CreateLabelBody,
  LabelListQuery,
  RecordId,
  UpdateLabelBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useLabelsApi = () => {
  const queryClient = useQueryClient();

  const invalidateLabels = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.labels.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
    ]);
  };

  const useLabelsList = (query?: LabelListQuery) =>
    useQuery({
      queryKey: queryKeys.labels.list(query),
      queryFn: () => request(labelsModule.list, { query }),
    });

  const useLabel = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.labels.detail(id),
      queryFn: () => request(labelsModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createLabelMutation = useMutation({
    mutationFn: (body: CreateLabelBody) =>
      request(labelsModule.create, { body }),
    onSuccess: invalidateLabels,
  });

  const updateLabelMutation = useMutation({
    mutationFn: ({ id, body }: { id: RecordId; body: UpdateLabelBody }) =>
      request(labelsModule.update, { body, params: { id } }),
    onSuccess: invalidateLabels,
  });

  const deleteLabelMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(labelsModule.delete, { params: { id } }),
    onSuccess: invalidateLabels,
  });

  return {
    useLabelsList,
    useLabel,
    createLabel: createLabelMutation.mutateAsync,
    updateLabel: (id: RecordId, body: UpdateLabelBody) =>
      updateLabelMutation.mutateAsync({ id, body }),
    deleteLabel: deleteLabelMutation.mutateAsync,
    isCreating: createLabelMutation.isPending,
    isUpdating: updateLabelMutation.isPending,
    isDeleting: deleteLabelMutation.isPending,
  };
};
