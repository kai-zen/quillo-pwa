"use client";

import { Archive, ArrowLeft, Pin, Plus, StickyNote } from "lucide-react";
import { FC, MouseEvent } from "react";
import {
  Button,
  IconButton,
  PageHeader,
  cn,
} from "@/components/common";
import type { Label, Note } from "@/shared/types";
import NoteFoldersPanel from "./folders/NoteFoldersPanel";
import { NoteEditorModal } from "./form/NoteForm";
import {
  ALL_NOTES,
  UNFILED_NOTES,
  folderLabel,
  formatNoteDate,
  labelsById,
} from "./helpers";
import type { NotesListViewModel } from "./hooks/useNotesListView";

interface Props {
  view: NotesListViewModel;
}

const emptyCopy = (
  folderFilter: NotesListViewModel["folderFilter"],
  showArchived: boolean,
): { title: string; description: string } => {
  if (showArchived) {
    return {
      title: "No archived notes",
      description: "Archived notes will show up here.",
    };
  }
  if (folderFilter === UNFILED_NOTES) {
    return {
      title: "No unfiled notes",
      description: "Notes without a folder will show up here.",
    };
  }
  if (folderFilter !== ALL_NOTES) {
    return {
      title: "No notes in this folder",
      description: "Create a note, or pick another folder.",
    };
  }
  return {
    title: "No notes yet",
    description: "Capture ideas, meeting notes, or anything outside a task.",
  };
};

const NoteLabels: FC<{ note: Note; labelMap: Map<string, Label> }> = ({
  note,
  labelMap,
}) => {
  const resolved = note.label_ids
    .map((id) => labelMap.get(id))
    .filter((label): label is Label => !!label);

  if (resolved.length === 0) {
    return <span className="text-xs text-muted">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {resolved.map((label) => (
        <span
          key={label._id}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-foreground"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: label.color }}
            aria-hidden
          />
          {label.name}
        </span>
      ))}
    </div>
  );
};

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
    pinError,
    openCreateNote,
    openEditNote,
    closeNoteForm,
    onNoteSaved,
    onTogglePinned,
  } = view;

  const empty = emptyCopy(folderFilter, showArchived);
  const labelMap = labelsById(labels);

  const onPinClick = (event: MouseEvent, note: Note) => {
    event.stopPropagation();
    void onTogglePinned(note._id);
  };

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
              label={showArchived ? "Show active notes" : "Show archived notes"}
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
                  : folders.find((folder) => folder._id === folderFilter)
                      ?.name ?? "Folder"}
            </span>
            <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
              {total} note{total === 1 ? "" : "s"}
            </span>
          </div>

          {pinError && <p className="text-sm text-rose-500">{pinError}</p>}

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
                <article
                  key={note._id}
                  className={cn(
                    "group relative min-h-44 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md",
                    note.archived && "opacity-70",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => openEditNote(note)}
                    aria-label={`Open note ${note.title}`}
                    className="flex h-full w-full cursor-pointer flex-col items-start pr-8 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <span className="line-clamp-2 font-medium text-foreground">
                      {note.title}
                    </span>
                    <span className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                      {note.content.replace(/\s+/g, " ").trim() || "No content"}
                    </span>
                    <span className="mt-auto pt-4 text-xs text-muted">
                      Updated {formatNoteDate(note.updated_at)}
                    </span>
                  </button>

                  <div className="absolute right-3 top-3">
                    <IconButton
                      label={
                        note.pinned
                          ? `Unpin ${note.title}`
                          : `Pin ${note.title}`
                      }
                      size="sm"
                      active={note.pinned}
                      onClick={(event) => onPinClick(event, note)}
                    >
                      <Pin
                        className={cn(
                          "h-3.5 w-3.5",
                          note.pinned && "fill-current",
                        )}
                        aria-hidden
                      />
                    </IconButton>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {folderFilter === ALL_NOTES && (
                      <span className="rounded-md bg-background px-2 py-0.5 text-[11px] font-medium text-muted">
                        {folderLabel(note.folder_id, folders)}
                      </span>
                    )}
                    <NoteLabels note={note} labelMap={labelMap} />
                  </div>
                </article>
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
