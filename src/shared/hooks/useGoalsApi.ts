"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goalsModule, request } from "@/shared/endpoints";
import type {
  CreateGoalBody,
  GoalListQuery,
  RecordId,
  UpdateGoalBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useGoalsApi = () => {
  const queryClient = useQueryClient();

  const invalidateGoals = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sprints.all }),
    ]);
  };

  const useGoalsList = (query?: GoalListQuery) =>
    useQuery({
      queryKey: queryKeys.goals.list(query),
      queryFn: () => request(goalsModule.list, { query }),
    });

  const useGoal = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.goals.detail(id),
      queryFn: () => request(goalsModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createGoalMutation = useMutation({
    mutationFn: (body: CreateGoalBody) => request(goalsModule.create, { body }),
    onSuccess: invalidateGoals,
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, body }: { id: RecordId; body: UpdateGoalBody }) =>
      request(goalsModule.update, { body, params: { id } }),
    onSuccess: invalidateGoals,
  });

  const deleteGoalMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(goalsModule.delete, { params: { id } }),
    onSuccess: invalidateGoals,
  });

  const toggleObjectiveMutation = useMutation({
    mutationFn: ({
      id,
      objectiveId,
    }: {
      id: RecordId;
      objectiveId: RecordId;
    }) =>
      request(goalsModule.toggleObjective, {
        params: { id, objectiveId },
      }),
    onSuccess: invalidateGoals,
  });

  return {
    useGoalsList,
    useGoal,
    createGoal: createGoalMutation.mutateAsync,
    updateGoal: (id: RecordId, body: UpdateGoalBody) =>
      updateGoalMutation.mutateAsync({ id, body }),
    deleteGoal: deleteGoalMutation.mutateAsync,
    toggleObjective: (id: RecordId, objectiveId: RecordId) =>
      toggleObjectiveMutation.mutateAsync({ id, objectiveId }),
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
    isTogglingObjective: toggleObjectiveMutation.isPending,
  };
};
