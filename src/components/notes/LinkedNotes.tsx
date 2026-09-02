"use client";

import { Pin, Plus, StickyNote } from "lucide-react";
import { FC } from "react";
import { Button, cn } from "@/components/common";
import { NoteEditorModal } from "./form/NoteForm";
import type { LinkedNotesViewModel } from "./hooks/useLinkedNotes";

interface Props {
  view: LinkedNotesViewModel;
  empty?: "hidden" | "placeholder";
  showAddButton?: boolean;
}

const LinkedNotes: FC<Props> = ({
  view,
  empty = "placeholder",
  showAddButton = true,
}) => {
  const {
    notes,
    isLoading,
    isError,
    isEmpty,
    noteFormMode,
    openCreate,
    openEdit,
    closeForm,
    onSaved,
  } = view;

  const editor = (
    <NoteEditorModal
      mode={noteFormMode}
      onClose={closeForm}
      onSaved={onSaved}
    />
  );

  if (
    empty === "hidden" &&
    (isLoading || isError || isEmpty)
  ) {
    return editor;
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Notes</p>
          {showAddButton && (
            <Button size="sm" variant="secondary" onClick={openCreate}>
              <Plus className="h-4 w-4" aria-hidden />
              Add note
            </Button>
          )}
        </div>

        {isLoading && <p className="text-sm text-muted">Loading notes…</p>}

        {isError && (
          <p className="text-sm text-foreground">
            Could not load notes. Try refreshing the page.
          </p>
        )}

        {isEmpty && (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
            <p className="font-medium text-foreground">No notes yet</p>
            <p className="mt-1 text-sm text-muted">
              Write a note without leaving this page.
            </p>
            {showAddButton && (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={openCreate}
                startIcon={<Plus className="w-4" aria-hidden />}
              >
                Add note
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && notes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {notes.map((note) => (
              <li key={note._id}>
                <button
                  type="button"
                  onClick={() => openEdit(note)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 text-left",
                    "hover:bg-foreground/3",
                  )}
                >
                  {note.pinned ? (
                    <Pin
                      className="h-3.5 w-3.5 shrink-0 fill-current text-foreground"
                      aria-hidden
                    />
                  ) : (
                    <StickyNote
                      className="h-3.5 w-3.5 shrink-0 text-muted"
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {note.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editor}
    </>
  );
};

export default LinkedNotes;
