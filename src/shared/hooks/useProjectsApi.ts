"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsModule, request } from "@/shared/endpoints";
import type {
  CreateProjectBody,
  ProjectListQuery,
  RecordId,
  UpdateProjectBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useProjectsApi = () => {
  const queryClient = useQueryClient();

  const invalidateProjects = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }),
    ]);
  };

  const useProjectsList = (query?: ProjectListQuery) =>
    useQuery({
      queryKey: queryKeys.projects.list(query),
      queryFn: () => request(projectsModule.list, { query }),
    });

  const useProject = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.projects.detail(id),
      queryFn: () => request(projectsModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createProjectMutation = useMutation({
    mutationFn: (body: CreateProjectBody) =>
      request(projectsModule.create, { body }),
    onSuccess: invalidateProjects,
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, body }: { id: RecordId; body: UpdateProjectBody }) =>
      request(projectsModule.update, { body, params: { id } }),
    onSuccess: invalidateProjects,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(projectsModule.delete, { params: { id } }),
    onSuccess: invalidateProjects,
  });

  return {
    useProjectsList,
    useProject,
    createProject: createProjectMutation.mutateAsync,
    updateProject: (id: RecordId, body: UpdateProjectBody) =>
      updateProjectMutation.mutateAsync({ id, body }),
    deleteProject: deleteProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
};
