"use client";

import { Archive, ArrowLeft, Plus, StickyNote } from "lucide-react";
import { FC } from "react";
import { Button, IconButton, PageHeader } from "@/components/common";
import NoteFoldersPanel from "./folders/NoteFoldersPanel";
import OpenFolderBar from "./folders/OpenFolderBar";
import { NoteEditorModal } from "./form/NoteForm";
import { labelsById, notesEmptyCopy } from "./helpers";
import type { NotesListViewModel } from "./hooks/useNotesListView";
import NoteCard from "./NoteCard";

interface Props {
  view: NotesListViewModel;
}

const NotesList: FC<Props> = ({ view }) => {
  const {
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
    openNote,
    closeNoteForm,
    onNoteSaved,
    onTogglePinned,
    onToggleArchived,
    onMoveToFolder,
    onCreateFolderAndMove,
    folderBusy,
  } = view;

  const inFolder = !!openFolder;
  const empty = notesEmptyCopy(inFolder, showArchived);
  const labelMap = labelsById(labels);
  const activeFolder =
    folders.find((folder) => folder._id === openFolder) ?? null;
  const showEmptyCard = isEmpty && (inFolder || folders.length === 0);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-5">
      <PageHeader
        title={showArchived ? "Archived notes" : "Notes"}
        description={
          showArchived
            ? "These notes are out of the way. Unarchive one to bring it back."
            : "Write freely, then file notes into folders when you want."
        }
        icon={showArchived ? Archive : StickyNote}
        actions={
          showArchived ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowArchivedAndResetPage(false)}
            >
              Show active notes
            </Button>
          ) : (
            <>
              <IconButton
                label="Show archived notes"
                onClick={() => setShowArchivedAndResetPage(true)}
              >
                <Archive className="h-4 w-4" aria-hidden />
              </IconButton>
              <Button onClick={openCreateNote} size="sm">
                <Plus className="h-4 w-4" aria-hidden />
                New note
              </Button>
            </>
          )
        }
      />

      <div className="flex min-w-0 flex-col gap-5">
        {inFolder ? (
          activeFolder ? (
            <OpenFolderBar
              folder={activeFolder}
              noteCount={total}
              onBack={closeFolder}
              onDeleted={closeFolder}
            />
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
              <Button variant="ghost" size="sm" onClick={closeFolder}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Notes
              </Button>
              <span className="text-sm font-medium text-foreground">Folder</span>
              <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
                {total} note{total === 1 ? "" : "s"}
              </span>
            </div>
          )
        ) : (
          <NoteFoldersPanel folders={folders} onOpen={openFolderAndResetPage} />
        )}

        {actionError && <p className="text-sm text-rose-500">{actionError}</p>}

        {isLoading && <p className="text-sm text-muted">Loading notes…</p>}

        {isError && (
          <p className="text-sm text-foreground">
            Could not load notes. Try refreshing the page.
          </p>
        )}

        {showEmptyCard && (
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
          <div className="grid min-w-0 gap-x-4 gap-y-6 pt-3 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                folders={folders}
                labelMap={labelMap}
                onOpen={openNote}
                onTogglePinned={onTogglePinned}
                onToggleArchived={onToggleArchived}
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
              onClick={() => setPage(Math.max(1, page - 1))}
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
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isFetching}
            >
              Next
            </Button>
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
