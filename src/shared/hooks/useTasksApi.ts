"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request, tasksModule } from "@/shared/endpoints";
import type {
  AssignToSprintBody,
  CreateTaskBody,
  RecordId,
  SortDailyTasksBody,
  TaskListQuery,
  UpdateTaskBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useTasksApi = () => {
  const queryClient = useQueryClient();

  const invalidateTasks = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });

  const useTasksList = (query?: TaskListQuery, enabled = true) =>
    useQuery({
      queryKey: queryKeys.tasks.list(query),
      queryFn: () => request(tasksModule.list, { query }),
      enabled,
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

  const assignToSprintMutation = useMutation({
    mutationFn: (body: AssignToSprintBody) =>
      request(tasksModule.assignToSprint, { body }),
    onSuccess: invalidateTasks,
  });

  const sortDailyTasksMutation = useMutation({
    mutationFn: (body: SortDailyTasksBody) =>
      request(tasksModule.sortDailyTasks, { body }),
    onSuccess: invalidateTasks,
  });

  return {
    useTasksList,
    useTask,
    createTask: createTaskMutation.mutateAsync,
    updateTask: (id: RecordId, body: UpdateTaskBody) =>
      updateTaskMutation.mutateAsync({ id, body }),
    deleteTask: deleteTaskMutation.mutateAsync,
    assignToSprint: assignToSprintMutation.mutateAsync,
    sortDailyTasks: sortDailyTasksMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isAssigning: assignToSprintMutation.isPending,
    isSorting: sortDailyTasksMutation.isPending,
  };
};
