"use client";

import { Pin, Plus } from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  type FC,
} from "react";
import { Button, cn, Markdown } from "@/components/common";
import type { Note } from "@/shared/types";
import { NoteEditorModal } from "./form/NoteForm";
import { formatNoteDate } from "./helpers";
import { useLinkedNotes, type LinkedNotesFilter } from "./hooks/useLinkedNotes";
import {
  getStickyNoteStyle,
  stickyNoteCssVars,
  tapePositionClass,
  tapeTransform,
} from "./stickyNote";

export type LinkedNotesHandle = {
  openCreate: () => void;
};

type Props = LinkedNotesFilter & {
  of?: string;
  className?: string;
  /** When false, parent owns the primary Add note CTA. Default true. */
  showAddButton?: boolean;
};

const LinkedNoteCard: FC<{
  note: Note;
  onOpen: (note: Note) => void;
}> = ({ note, onOpen }) => {
  const sticky = getStickyNoteStyle(note._id);
  const style = stickyNoteCssVars(sticky);

  return (
    <button
      type="button"
      onClick={() => onOpen(note)}
      aria-label={`Open note ${note.title}${note.pinned ? ", pinned" : ""}`}
      style={style}
      className={cn(
        "group/note relative flex h-full min-w-0 w-full rotate-[var(--tilt)] cursor-pointer flex-col rounded-sm border p-4 pt-6 text-left shadow-[2px_4px_10px_-2px_rgba(0,0,0,0.18)]",
        "transition-all duration-200 ease-out will-change-transform",
        "hover:z-10 hover:rotate-0 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[2px_10px_20px_-4px_rgba(0,0,0,0.25)]",
        "focus-visible:z-10 focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        sticky.cardClassName,
      )}
    >
      <span
        aria-hidden
        style={{ transform: tapeTransform(sticky.tapeSide) }}
        className={cn(
          "pointer-events-none absolute -top-3 h-5 w-14 rounded-[2px] border shadow-sm backdrop-blur-[1px]",
          tapePositionClass[sticky.tapeSide],
          sticky.tapeClassName,
        )}
      />
      <span className="flex w-full min-w-0 items-start gap-2">
        <span className="line-clamp-2 min-w-0 flex-1 wrap-anywhere font-medium text-foreground">
          {note.title}
        </span>
        {note.pinned ? (
          <Pin
            className="mt-0.5 h-3.5 w-3.5 shrink-0 fill-current text-foreground"
            aria-hidden
          />
        ) : null}
      </span>
      {note.content.trim() ? (
        <Markdown
          compact
          expandable={false}
          className="pointer-events-none mt-2 min-w-0 w-full flex-1 [&_a]:no-underline"
        >
          {note.content}
        </Markdown>
      ) : (
        <span className="mt-2 min-w-0 w-full flex-1 text-sm leading-6 text-muted">
          No content
        </span>
      )}
      <span className="mt-3 block border-t border-black/10 pt-2.5 text-xs text-muted dark:border-white/10">
        Updated {formatNoteDate(note.updated_at)}
      </span>
    </button>
  );
};

const LinkedNotes = forwardRef<LinkedNotesHandle, Props>(function LinkedNotes(
  { of, className, showAddButton = true, ...filter },
  ref,
) {
  const {
    notes,
    isLoading,
    isError,
    isEmpty,
    noteFormMode,
    openCreate,
    openNote,
    closeForm,
    onSaved,
  } = useLinkedNotes(filter);
  const subject = of || (filter.date ? formatNoteDate(filter.date) : "");
  const title = subject ? `Notes of ${subject}` : "Notes";

  useImperativeHandle(ref, () => ({ openCreate }), [openCreate]);

  return (
    <>
      <div className={cn("flex flex-col gap-3", className)}>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p
            className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
            title={title}
          >
            {title}
          </p>
          {showAddButton ? (
            <Button
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={openCreate}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add note
            </Button>
          ) : null}
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
            <Button
              variant="secondary"
              className="mt-4"
              onClick={openCreate}
              startIcon={<Plus className="w-4" aria-hidden />}
            >
              Add note
            </Button>
          </div>
        )}

        {!isLoading && !isError && notes.length > 0 && (
          <ul className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-6 pt-3 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((note) => (
              <li key={note._id} className="min-w-0">
                <LinkedNoteCard note={note} onOpen={openNote} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <NoteEditorModal
        mode={noteFormMode}
        onClose={closeForm}
        onSaved={onSaved}
      />
    </>
  );
});

export default LinkedNotes;
