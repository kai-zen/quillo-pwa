"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request, sprintsModule } from "@/shared/endpoints";
import type {
  CreateSprintBody,
  RecordId,
  SprintListQuery,
  UpdateSprintBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useSprintsApi = () => {
  const queryClient = useQueryClient();

  const invalidateSprints = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.sprints.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all }),
    ]);
  };

  const useSprintsList = (query?: SprintListQuery) =>
    useQuery({
      queryKey: queryKeys.sprints.list(query),
      queryFn: () => request(sprintsModule.list, { query }),
    });

  const useSprint = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.sprints.detail(id),
      queryFn: () => request(sprintsModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createSprintMutation = useMutation({
    mutationFn: (body: CreateSprintBody) =>
      request(sprintsModule.create, { body }),
    onSuccess: invalidateSprints,
  });

  const updateSprintMutation = useMutation({
    mutationFn: ({ id, body }: { id: RecordId; body: UpdateSprintBody }) =>
      request(sprintsModule.update, { body, params: { id } }),
    onSuccess: invalidateSprints,
  });

  const deleteSprintMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(sprintsModule.delete, { params: { id } }),
    onSuccess: invalidateSprints,
  });

  return {
    useSprintsList,
    useSprint,
    createSprint: createSprintMutation.mutateAsync,
    updateSprint: (id: RecordId, body: UpdateSprintBody) =>
      updateSprintMutation.mutateAsync({ id, body }),
    deleteSprint: deleteSprintMutation.mutateAsync,
    isCreating: createSprintMutation.isPending,
    isUpdating: updateSprintMutation.isPending,
    isDeleting: deleteSprintMutation.isPending,
  };
};
