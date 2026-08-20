"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request, tasksModule } from "@/shared/endpoints";
import type {
  CreateTaskBody,
  RecordId,
  TaskListQuery,
  UpdateTaskBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useTasksApi = () => {
  const queryClient = useQueryClient();

  const invalidateTasks = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });

  const useTasksList = (query?: TaskListQuery) =>
    useQuery({
      queryKey: queryKeys.tasks.list(query),
      queryFn: () => request(tasksModule.list, { query }),
    });

  const useTask = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.tasks.detail(id),
      queryFn: () => request(tasksModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createTaskMutation = useMutation({
    mutationFn: (body: CreateTaskBody) =>
      request(tasksModule.create, { body }),
    onSuccess: invalidateTasks,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, body }: { id: RecordId; body: UpdateTaskBody }) =>
      request(tasksModule.update, { body, params: { id } }),
    onSuccess: invalidateTasks,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(tasksModule.delete, { params: { id } }),
    onSuccess: invalidateTasks,
  });

  return {
    useTasksList,
    useTask,
    createTask: createTaskMutation.mutateAsync,
    updateTask: (id: RecordId, body: UpdateTaskBody) =>
      updateTaskMutation.mutateAsync({ id, body }),
    deleteTask: deleteTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};
