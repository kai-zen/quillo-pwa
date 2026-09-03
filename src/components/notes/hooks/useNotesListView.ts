"use client";

import { useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import {
  useLabelsApi,
  useNoteFoldersApi,
  useNotesApi,
} from "@/shared/hooks";
import type {
  Label,
  Note,
  NoteFolder,
  NoteListQuery,
  RecordId,
} from "@/shared/types";
import type { NoteFormMode } from "../form/useNoteForm";
import {
  UNFILED_QUERY_VALUE,
  comparePinnedFirst,
  toUpdateBody,
} from "../helpers";

const PAGE_LIMIT = 50;

export function useNotesListView() {
  const { useNotesList, togglePinned, updateNote, isUpdating } = useNotesApi();
  const {
    useNoteFoldersList,
    createNoteFolder,
    isCreating: isCreatingFolder,
  } = useNoteFoldersApi();
  const { useLabelsList } = useLabelsApi();

  const [openFolder, setOpenFolder] = useState<RecordId | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [noteFormMode, setNoteFormMode] = useState<NoteFormMode | null>(null);
  const [actionError, setActionError] = useState("");

  const listQuery: NoteListQuery = {
    page,
    limit: PAGE_LIMIT,
    archived: showArchived,
    folder_id: openFolder ?? UNFILED_QUERY_VALUE,
  };

  const notesQuery = useNotesList(listQuery);
  const foldersQuery = useNoteFoldersList({ page: 1, limit: 100 });
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });

  const notes: Note[] = [...(notesQuery.data?.items ?? [])].sort(
    comparePinnedFirst,
  );
  const folders: NoteFolder[] = [...(foldersQuery.data?.items ?? [])].sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  const labels: Label[] = labelsQuery.data?.items ?? [];
  const total = notesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isLoading = notesQuery.isLoading;
  const isError = notesQuery.isError;
  const isEmpty = !isLoading && !isError && notes.length === 0;
  const isFetching = notesQuery.isFetching;

  const openCreateNote = () =>
    setNoteFormMode({
      type: "create",
      folderId: openFolder,
    });
  const openEditNote = (note: Note) =>
    setNoteFormMode({ type: "edit", note });
  const closeNoteForm = () => setNoteFormMode(null);
  const onNoteSaved = () => setNoteFormMode(null);

  const openFolderAndResetPage = (id: RecordId) => {
    setOpenFolder(id);
    setPage(1);
  };

  const closeFolder = () => {
    setOpenFolder(null);
    setPage(1);
  };

  const setShowArchivedAndResetPage = (archived: boolean) => {
    setShowArchived(archived);
    setPage(1);
  };

  const onTogglePinned = async (id: RecordId) => {
    setActionError("");
    try {
      await togglePinned(id);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update pin."));
    }
  };

  const onMoveToFolder = async (note: Note, folderId: RecordId | null) => {
    if (note.folder_id === folderId) return;
    setActionError("");
    try {
      await updateNote(note._id, { ...toUpdateBody(note), folder_id: folderId });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update folder."));
      throw err;
    }
  };

  const onCreateFolderAndMove = async (note: Note, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setActionError("");
    try {
      const folder = await createNoteFolder({ name: trimmed });
      await updateNote(note._id, {
        ...toUpdateBody(note),
        folder_id: folder._id,
      });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not create folder."));
      throw err;
    }
  };

  return {
    openFolder,
    openFolderAndResetPage,
    closeFolder,
    showArchived,
    setShowArchivedAndResetPage,
    page,
    setPage,
    noteFormMode,
    notes,
    folders,
    labels,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    actionError,
    openCreateNote,
    openEditNote,
    closeNoteForm,
    onNoteSaved,
    onTogglePinned,
    onMoveToFolder,
    onCreateFolderAndMove,
    folderBusy: isUpdating || isCreatingFolder,
  };
}

export type NotesListViewModel = ReturnType<typeof useNotesListView>;
