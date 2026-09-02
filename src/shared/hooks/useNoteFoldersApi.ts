"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { noteFoldersModule, request } from "@/shared/endpoints";
import type {
  CreateNoteFolderBody,
  NoteFolderListQuery,
  RecordId,
  UpdateNoteFolderBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useNoteFoldersApi = () => {
  const queryClient = useQueryClient();

  const invalidateNoteFolders = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.noteFolders.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all }),
    ]);
  };

  const useNoteFoldersList = (query?: NoteFolderListQuery) =>
    useQuery({
      queryKey: queryKeys.noteFolders.list(query),
      queryFn: () => request(noteFoldersModule.list, { query }),
    });

  const useNoteFolder = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.noteFolders.detail(id),
      queryFn: () => request(noteFoldersModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createNoteFolderMutation = useMutation({
    mutationFn: (body: CreateNoteFolderBody) =>
      request(noteFoldersModule.create, { body }),
    onSuccess: invalidateNoteFolders,
  });

  const updateNoteFolderMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: RecordId;
      body: UpdateNoteFolderBody;
    }) => request(noteFoldersModule.update, { body, params: { id } }),
    onSuccess: invalidateNoteFolders,
  });

  const deleteNoteFolderMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(noteFoldersModule.delete, { params: { id } }),
    onSuccess: invalidateNoteFolders,
  });

  return {
    useNoteFoldersList,
    useNoteFolder,
    createNoteFolder: createNoteFolderMutation.mutateAsync,
    updateNoteFolder: (id: RecordId, body: UpdateNoteFolderBody) =>
      updateNoteFolderMutation.mutateAsync({ id, body }),
    deleteNoteFolder: deleteNoteFolderMutation.mutateAsync,
    isCreating: createNoteFolderMutation.isPending,
    isUpdating: updateNoteFolderMutation.isPending,
    isDeleting: deleteNoteFolderMutation.isPending,
  };
};
