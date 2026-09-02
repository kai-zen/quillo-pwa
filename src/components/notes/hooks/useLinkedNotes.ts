"use client";

import { useState } from "react";
import { useNotesApi } from "@/shared/hooks";
import type { Note, NoteListQuery, RecordId } from "@/shared/types";
import type { NoteCreateContext, NoteFormMode } from "../form/useNoteForm";

const PAGE_LIMIT = 50;

export type LinkedNotesFilter = {
  date?: string;
  goalId?: RecordId;
  sprintId?: RecordId;
};

export function useLinkedNotes(filter: LinkedNotesFilter) {
  const { useNotesList } = useNotesApi();
  const [noteFormMode, setNoteFormMode] = useState<NoteFormMode | null>(null);

  const listQuery: NoteListQuery = {
    page: 1,
    limit: PAGE_LIMIT,
    archived: false,
    ...(filter.date ? { date: filter.date } : {}),
    ...(filter.goalId ? { goal_id: filter.goalId } : {}),
    ...(filter.sprintId ? { sprint_id: filter.sprintId } : {}),
  };

  const create: NoteCreateContext = {
    date: filter.date ?? null,
    goalId: filter.goalId ?? null,
    sprintId: filter.sprintId ?? null,
  };

  const notesQuery = useNotesList(listQuery);
  const notes: Note[] = notesQuery.data?.items ?? [];

  const openCreate = () => setNoteFormMode({ type: "create", ...create });
  const openEdit = (note: Note) => setNoteFormMode({ type: "edit", note });
  const closeForm = () => setNoteFormMode(null);
  const onSaved = () => setNoteFormMode(null);

  return {
    notes,
    isLoading: notesQuery.isLoading,
    isError: notesQuery.isError,
    isEmpty: !notesQuery.isLoading && !notesQuery.isError && notes.length === 0,
    noteFormMode,
    openCreate,
    openEdit,
    closeForm,
    onSaved,
  };
}

export type LinkedNotesViewModel = ReturnType<typeof useLinkedNotes>;
