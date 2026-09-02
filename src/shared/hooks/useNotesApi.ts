"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesModule, request } from "@/shared/endpoints";
import type {
  CreateNoteBody,
  NoteListQuery,
  RecordId,
  UpdateNoteBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useNotesApi = () => {
  const queryClient = useQueryClient();

  const invalidateNotes = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notes.all });

  const useNotesList = (query?: NoteListQuery) =>
    useQuery({
      queryKey: queryKeys.notes.list(query),
      queryFn: () => request(notesModule.list, { query }),
    });

  const useNote = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.notes.detail(id),
      queryFn: () => request(notesModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createNoteMutation = useMutation({
    mutationFn: (body: CreateNoteBody) =>
      request(notesModule.create, { body }),
    onSuccess: invalidateNotes,
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, body }: { id: RecordId; body: UpdateNoteBody }) =>
      request(notesModule.update, { body, params: { id } }),
    onSuccess: invalidateNotes,
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(notesModule.delete, { params: { id } }),
    onSuccess: invalidateNotes,
  });

  const togglePinnedMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(notesModule.togglePinned, { params: { id } }),
    onSuccess: invalidateNotes,
  });

  return {
    useNotesList,
    useNote,
    createNote: createNoteMutation.mutateAsync,
    updateNote: (id: RecordId, body: UpdateNoteBody) =>
      updateNoteMutation.mutateAsync({ id, body }),
    deleteNote: deleteNoteMutation.mutateAsync,
    togglePinned: togglePinnedMutation.mutateAsync,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    isTogglingPinned: togglePinnedMutation.isPending,
  };
};
