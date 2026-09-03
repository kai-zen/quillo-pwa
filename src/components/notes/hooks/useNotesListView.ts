"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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
  readNotesUrlFilters,
  toUpdateBody,
  writeNotesUrlFilters,
  type NotesUrlFilters,
} from "../helpers";

const PAGE_LIMIT = 50;

export function useNotesListView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { useNotesList, togglePinned, toggleArchived, updateNote, isUpdating } =
    useNotesApi();
  const {
    useNoteFoldersList,
    createNoteFolder,
    isCreating: isCreatingFolder,
  } = useNoteFoldersApi();
  const { useLabelsList } = useLabelsApi();

  const { folder: openFolder, archived: showArchived, page } = useMemo(
    () => readNotesUrlFilters(searchParams),
    [searchParams],
  );
  const [noteFormMode, setNoteFormMode] = useState<NoteFormMode | null>(null);
  const [actionError, setActionError] = useState("");

  const applyFilters = useCallback(
    (
      patch: Partial<NotesUrlFilters>,
      history: "push" | "replace" = "replace",
    ) => {
      const folder = patch.folder !== undefined ? patch.folder : openFolder;
      const archived =
        patch.archived !== undefined ? patch.archived : showArchived;
      const resetsPage =
        patch.folder !== undefined || patch.archived !== undefined;
      const nextPage =
        patch.page !== undefined ? patch.page : resetsPage ? 1 : page;

      const qs = writeNotesUrlFilters(searchParams, {
        folder,
        archived,
        page: nextPage,
      });
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (history === "push") router.push(href, { scroll: false });
      else router.replace(href, { scroll: false });
    },
    [openFolder, page, pathname, router, searchParams, showArchived],
  );

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

  const openFolderAndResetPage = (id: RecordId) =>
    applyFilters({ folder: id }, "push");
  const closeFolder = () => applyFilters({ folder: null }, "replace");
  const setShowArchivedAndResetPage = (archived: boolean) =>
    applyFilters({ archived });
  const setPage = (nextPage: number) => applyFilters({ page: nextPage });

  const onTogglePinned = async (id: RecordId) => {
    setActionError("");
    try {
      await togglePinned(id);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update pin."));
    }
  };

  const onToggleArchived = async (id: RecordId) => {
    setActionError("");
    try {
      await toggleArchived(id);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update archive."));
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
    onToggleArchived,
    onMoveToFolder,
    onCreateFolderAndMove,
    folderBusy: isUpdating || isCreatingFolder,
  };
}

export type NotesListViewModel = ReturnType<typeof useNotesListView>;
