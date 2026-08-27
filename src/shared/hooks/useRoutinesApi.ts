"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request, routinesModule } from "@/shared/endpoints";
import type {
  ApplyRoutinesBody,
  CreateRoutineBody,
  RecordId,
  RoutineListQuery,
  UpdateRoutineBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useRoutinesApi = () => {
  const queryClient = useQueryClient();

  const invalidateRoutines = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.routines.all });

  const invalidateAfterApply = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.routines.all }),
    ]);
  };

  const useRoutinesList = (query?: RoutineListQuery, enabled = true) =>
    useQuery({
      queryKey: queryKeys.routines.list(query),
      queryFn: () => request(routinesModule.list, { query }),
      enabled,
    });

  const useRoutine = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.routines.detail(id),
      queryFn: () => request(routinesModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createRoutineMutation = useMutation({
    mutationFn: (body: CreateRoutineBody) =>
      request(routinesModule.create, { body }),
    onSuccess: invalidateRoutines,
  });

  const updateRoutineMutation = useMutation({
    mutationFn: ({ id, body }: { id: RecordId; body: UpdateRoutineBody }) =>
      request(routinesModule.update, { body, params: { id } }),
    onSuccess: invalidateRoutines,
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(routinesModule.delete, { params: { id } }),
    onSuccess: invalidateRoutines,
  });

  const applyRoutinesMutation = useMutation({
    mutationFn: (body: ApplyRoutinesBody) =>
      request(routinesModule.apply, { body }),
    onSuccess: invalidateAfterApply,
  });

  return {
    useRoutinesList,
    useRoutine,
    createRoutine: createRoutineMutation.mutateAsync,
    updateRoutine: (id: RecordId, body: UpdateRoutineBody) =>
      updateRoutineMutation.mutateAsync({ id, body }),
    deleteRoutine: deleteRoutineMutation.mutateAsync,
    applyRoutines: applyRoutinesMutation.mutateAsync,
    isCreating: createRoutineMutation.isPending,
    isUpdating: updateRoutineMutation.isPending,
    isDeleting: deleteRoutineMutation.isPending,
    isApplying: applyRoutinesMutation.isPending,
  };
};
