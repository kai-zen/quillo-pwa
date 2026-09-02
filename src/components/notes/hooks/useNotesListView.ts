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
  ALL_NOTES,
  UNFILED_NOTES,
  UNFILED_QUERY_VALUE,
  comparePinnedFirst,
  isNamedFolder,
  type FolderFilter,
} from "../helpers";

const PAGE_LIMIT = 50;

export function useNotesListView() {
  const { useNotesList, togglePinned } = useNotesApi();
  const { useNoteFoldersList } = useNoteFoldersApi();
  const { useLabelsList } = useLabelsApi();

  const [folderFilter, setFolderFilter] = useState<FolderFilter>(ALL_NOTES);
  const [folderOpen, setFolderOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [noteFormMode, setNoteFormMode] = useState<NoteFormMode | null>(null);
  const [pinError, setPinError] = useState("");

  const listQuery: NoteListQuery = {
    page,
    limit: PAGE_LIMIT,
    archived: showArchived,
    ...(folderFilter === UNFILED_NOTES
      ? { folder_id: UNFILED_QUERY_VALUE }
      : {}),
    ...(isNamedFolder(folderFilter) ? { folder_id: folderFilter } : {}),
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
      folderId: isNamedFolder(folderFilter) ? folderFilter : null,
    });
  const openEditNote = (note: Note) =>
    setNoteFormMode({ type: "edit", note });
  const closeNoteForm = () => setNoteFormMode(null);
  const onNoteSaved = () => setNoteFormMode(null);

  const setFolderFilterAndResetPage = (filter: FolderFilter) => {
    setFolderFilter(filter);
    setPage(1);
    setFolderOpen(true);
  };

  const closeFolder = () => {
    setFolderOpen(false);
    setPage(1);
  };

  const setShowArchivedAndResetPage = (archived: boolean) => {
    setShowArchived(archived);
    setPage(1);
  };

  const onTogglePinned = async (id: RecordId) => {
    setPinError("");
    try {
      await togglePinned(id);
    } catch (err) {
      setPinError(getErrorMessage(err, "Could not update pin."));
    }
  };

  return {
    folderFilter,
    folderOpen,
    setFolderFilterAndResetPage,
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
    pinError,
    openCreateNote,
    openEditNote,
    closeNoteForm,
    onNoteSaved,
    onTogglePinned,
  };
}

export type NotesListViewModel = ReturnType<typeof useNotesListView>;
