"use client";

import { Pin, Plus, StickyNote } from "lucide-react";
import { FC, MouseEvent } from "react";
import {
  Button,
  IconButton,
  Modal,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  cn,
} from "@/components/common";
import type { Label, Note } from "@/shared/types";
import NoteFoldersPanel from "./folders/NoteFoldersPanel";
import NoteForm, { noteFormTitle } from "./form/NoteForm";
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
    setFolderFilterAndResetPage,
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

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <NoteFoldersPanel
          folders={folders}
          selected={folderFilter}
          onSelect={setFolderFilterAndResetPage}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
            <Tabs
              value={showArchived ? "archived" : "active"}
              onChange={(value) =>
                setShowArchivedAndResetPage(value === "archived")
              }
              options={[
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
              ]}
              aria-label="Filter archived notes"
              className="w-full sm:w-auto"
            />
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <span className="sr-only">Pinned</span>
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-40">Folder</TableHead>
                  <TableHead className="w-48">Labels</TableHead>
                  <TableHead className="w-32">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((note) => (
                  <TableRow
                    key={note._id}
                    onClick={() => openEditNote(note)}
                    aria-label={`Open note ${note.title}`}
                    className={note.archived ? "opacity-70" : undefined}
                  >
                    <TableCell>
                      <IconButton
                        label={
                          note.pinned
                            ? `Unpin ${note.title}`
                            : `Pin ${note.title}`
                        }
                        size="sm"
                        active={note.pinned}
                        onClick={(event) => onPinClick(event, note)}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        <Pin
                          className={cn(
                            "h-3.5 w-3.5",
                            note.pinned && "fill-current",
                          )}
                          aria-hidden
                        />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <span className="block truncate font-medium text-foreground">
                        {note.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted">
                        {folderLabel(note.folder_id, folders)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <NoteLabels note={note} labelMap={labelMap} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted">
                        {formatNoteDate(note.updated_at)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
      </div>

      <Modal
        open={!!noteFormMode}
        onClose={closeNoteForm}
        title={noteFormMode ? noteFormTitle(noteFormMode) : ""}
        className="max-w-3xl"
      >
        {noteFormMode && (
          <NoteForm
            key={
              noteFormMode.type === "edit" ? noteFormMode.note._id : "create"
            }
            mode={noteFormMode}
            folders={folders}
            labels={labels}
            onClose={closeNoteForm}
            onSaved={onNoteSaved}
          />
        )}
      </Modal>
    </div>
  );
};

export default NotesList;
