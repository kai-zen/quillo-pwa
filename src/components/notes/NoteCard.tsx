"use client";

import { Archive, Pin } from "lucide-react";
import { FC, MouseEvent } from "react";
import { cn, IconButton, Markdown } from "@/components/common";
import type { Label, Note, NoteFolder, RecordId } from "@/shared/types";
import { formatNoteDate } from "./helpers";
import NoteFolderPicker from "./NoteFolderPicker";
import {
  getStickyNoteStyle,
  stickyNoteCssVars,
  tapePositionClass,
  tapeTransform,
} from "./stickyNote";

interface Props {
  note: Note;
  folders: NoteFolder[];
  labelMap: Map<string, Label>;
  onOpen: (note: Note) => void;
  onTogglePinned: (id: string) => void | Promise<void>;
  onToggleArchived: (id: string) => void | Promise<void>;
  onMoveToFolder: (
    note: Note,
    folderId: RecordId | null,
  ) => void | Promise<void>;
  onCreateFolderAndMove: (note: Note, name: string) => void | Promise<void>;
  folderBusy?: boolean;
}

const NoteCard: FC<Props> = ({
  note,
  folders,
  labelMap,
  onOpen,
  onTogglePinned,
  onToggleArchived,
  onMoveToFolder,
  onCreateFolderAndMove,
  folderBusy,
}) => {
  const labels = note.label_ids
    .map((id) => labelMap.get(id))
    .filter((label): label is Label => !!label);
  const visibleLabels = labels.slice(0, 2);

  const handleActionClick =
    (action: () => void | Promise<void>) => (event: MouseEvent) => {
      event.stopPropagation();
      void action();
    };

  const sticky = getStickyNoteStyle(note._id);
  const style = stickyNoteCssVars(sticky);

  return (
    <article
      style={style}
      className={cn(
        "group relative flex min-h-48 min-w-0 w-full rotate-[var(--tilt)] flex-col rounded-sm border p-4 pt-6 shadow-[2px_4px_10px_-2px_rgba(0,0,0,0.18)]",
        "transition-all duration-200 ease-out will-change-transform",
        "hover:z-10 hover:rotate-0 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[2px_10px_20px_-4px_rgba(0,0,0,0.25)]",
        "focus-within:z-20 has-aria-expanded:z-20 overflow-hidden",
        sticky.cardClassName,
        note.archived && "opacity-70",
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

      <button
        type="button"
        onClick={() => onOpen(note)}
        aria-label={`Open note ${note.title}`}
        className="flex min-h-0 min-w-0 w-full flex-1 cursor-pointer flex-col items-start pr-16 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <span className="line-clamp-2 w-full min-w-0 wrap-anywhere font-medium text-foreground">
          {note.title}
        </span>
        {note.content.trim() ? (
          <Markdown
            compact
            expandable={false}
            className="pointer-events-none mt-2 w-full min-w-0 [&_a]:no-underline"
          >
            {note.content}
          </Markdown>
        ) : (
          <span className="mt-2 text-sm leading-6 text-muted">No content</span>
        )}
      </button>

      <div className="absolute right-3 top-3 flex">
        <IconButton
          label={
            note.archived ? `Unarchive ${note.title}` : `Archive ${note.title}`
          }
          size="sm"
          active={note.archived}
          onClick={handleActionClick(() => onToggleArchived(note._id))}
        >
          <Archive
            className={cn("h-3.5 w-3.5", note.archived && "fill-current")}
            aria-hidden
          />
        </IconButton>
        <IconButton
          label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
          size="sm"
          active={note.pinned}
          onClick={handleActionClick(() => onTogglePinned(note._id))}
        >
          <Pin
            className={cn("h-3.5 w-3.5", note.pinned && "fill-current")}
            aria-hidden
          />
        </IconButton>
      </div>

      <footer className="mt-4 min-w-0 border-t border-black/10 pt-3 dark:border-white/10">
        <span className="block text-xs text-muted">
          Updated {formatNoteDate(note.updated_at)}
        </span>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
          <NoteFolderPicker
            noteTitle={note.title}
            folderId={note.folder_id}
            folders={folders}
            disabled={folderBusy}
            onMove={(folderId) => onMoveToFolder(note, folderId)}
            onCreateAndMove={(name) => onCreateFolderAndMove(note, name)}
          />
          {labels.length > 0 && (
            <div className="flex min-w-0 max-w-full items-center gap-1 overflow-hidden">
              {visibleLabels.map((label) => (
                <span
                  key={label._id}
                  title={label.name}
                  className="inline-flex min-w-0 shrink items-center gap-1.5 truncate rounded-md bg-accent-soft px-2 py-1 text-[11px] font-medium text-foreground"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: label.color }}
                    aria-hidden
                  />
                  <span className="truncate">{label.name}</span>
                </span>
              ))}
              {labels.length > visibleLabels.length && (
                <span
                  title={labels
                    .slice(visibleLabels.length)
                    .map((label) => label.name)
                    .join(", ")}
                  className="shrink-0 rounded-md bg-background px-2 py-1 text-[11px] font-medium text-muted"
                >
                  +{labels.length - visibleLabels.length}
                </span>
              )}
            </div>
          )}
        </div>
      </footer>
    </article>
  );
};

export default NoteCard;
