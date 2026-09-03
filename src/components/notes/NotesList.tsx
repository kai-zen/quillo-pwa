"use client";

import { Archive, ArrowLeft, Plus, StickyNote } from "lucide-react";
import { FC } from "react";
import { Button, IconButton, PageHeader } from "@/components/common";
import NoteFoldersPanel from "./folders/NoteFoldersPanel";
import { NoteEditorModal } from "./form/NoteForm";
import {
  ALL_NOTES,
  UNFILED_NOTES,
  labelsById,
  notesEmptyCopy,
} from "./helpers";
import type { NotesListViewModel } from "./hooks/useNotesListView";
import NoteCard from "./NoteCard";

interface Props {
  view: NotesListViewModel;
}

const NotesList: FC<Props> = ({ view }) => {
  const {
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
    actionError,
    openCreateNote,
    openEditNote,
    closeNoteForm,
    onNoteSaved,
    onTogglePinned,
    onMoveToFolder,
    onCreateFolderAndMove,
    folderBusy,
  } = view;

  const empty = notesEmptyCopy(folderFilter, showArchived);
  const labelMap = labelsById(labels);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title="Notes"
        description="Write freely, then file notes into folders when you want."
        icon={StickyNote}
        actions={
          <Button onClick={openCreateNote} size="sm">
            <Plus className="h-4 w-4" aria-hidden />
            New note
          </Button>
        }
      />

      <div className="flex flex-col gap-5">
        {!folderOpen && (
          <NoteFoldersPanel
            folders={folders}
            selected={null}
            onSelect={setFolderFilterAndResetPage}
          />
        )}

        {folderOpen && (
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
              <Button variant="ghost" size="sm" onClick={closeFolder}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Folders
              </Button>
              <IconButton
                label={
                  showArchived ? "Show active notes" : "Show archived notes"
                }
                active={showArchived}
                onClick={() => setShowArchivedAndResetPage(!showArchived)}
              >
                <Archive className="h-4 w-4" aria-hidden />
              </IconButton>
              <span className="text-sm font-medium text-foreground sm:ml-1">
                {folderFilter === ALL_NOTES
                  ? "All notes"
                  : folderFilter === UNFILED_NOTES
                    ? "Unfiled"
                    : (folders.find((folder) => folder._id === folderFilter)
                        ?.name ?? "Folder")}
              </span>
              <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
                {total} note{total === 1 ? "" : "s"}
              </span>
            </div>

            {actionError && (
              <p className="text-sm text-rose-500">{actionError}</p>
            )}

            {isLoading && <p className="text-sm text-muted">Loading notes…</p>}

            {isError && (
              <p className="text-sm text-foreground">
                Could not load notes. Try refreshing the page.
              </p>
            )}

            {isEmpty && (
              <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
                <p className="font-medium text-foreground">{empty.title}</p>
                <p className="mt-1 text-sm text-muted">{empty.description}</p>
                {!showArchived && (
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={openCreateNote}
                    startIcon={<Plus className="w-4" aria-hidden />}
                  >
                    New note
                  </Button>
                )}
              </div>
            )}

            {!isLoading && !isError && notes.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {notes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    folders={folders}
                    labelMap={labelMap}
                    onOpen={openEditNote}
                    onTogglePinned={onTogglePinned}
                    onMoveToFolder={onMoveToFolder}
                    onCreateFolderAndMove={onCreateFolderAndMove}
                    folderBusy={folderBusy}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || isFetching}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages || isFetching}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <NoteEditorModal
        mode={noteFormMode}
        onClose={closeNoteForm}
        onSaved={onNoteSaved}
      />
    </div>
  );
};

export default NotesList;
