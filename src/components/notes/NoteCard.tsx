"use client";

import { Pin } from "lucide-react";
import { FC, MouseEvent } from "react";
import { cn, IconButton } from "@/components/common";
import type { Label, Note } from "@/shared/types";
import { formatNoteDate } from "./helpers";

interface Props {
  note: Note;
  labelMap: Map<string, Label>;
  folderName?: string;
  onOpen: (note: Note) => void;
  onTogglePinned: (id: string) => void | Promise<void>;
}

const NoteCard: FC<Props> = ({
  note,
  labelMap,
  folderName,
  onOpen,
  onTogglePinned,
}) => {
  const labels = note.label_ids
    .map((id) => labelMap.get(id))
    .filter((label): label is Label => !!label);
  const visibleLabels = labels.slice(0, 2);

  const handlePinClick = (event: MouseEvent) => {
    event.stopPropagation();
    void onTogglePinned(note._id);
  };

  return (
    <article
      className={cn(
        "group relative flex min-h-48 flex-col overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md",
        note.archived && "opacity-70",
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(note)}
        aria-label={`Open note ${note.title}`}
        className="flex min-h-0 flex-1 cursor-pointer flex-col items-start pr-8 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <span className="line-clamp-2 font-medium text-foreground">
          {note.title}
        </span>
        <span className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
          {note.content.replace(/\s+/g, " ").trim() || "No content"}
        </span>
      </button>

      <div className="absolute right-3 top-3">
        <IconButton
          label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
          size="sm"
          active={note.pinned}
          onClick={handlePinClick}
        >
          <Pin
            className={cn("h-3.5 w-3.5", note.pinned && "fill-current")}
            aria-hidden
          />
        </IconButton>
      </div>

      <footer className="mt-4 min-w-0 border-t border-border/70 pt-3">
        <span className="block text-xs text-muted">
          Updated {formatNoteDate(note.updated_at)}
        </span>
        {(folderName || labels.length > 0) && (
          <div
            className={cn(
              "mt-2 grid min-w-0 items-center gap-1.5",
              folderName && "grid-cols-[minmax(0,auto)_minmax(0,1fr)]",
            )}
          >
            {folderName && (
              <span
                title={folderName}
                className="truncate rounded-md bg-background px-2 py-1 text-[11px] font-medium text-muted"
              >
                {folderName}
              </span>
            )}
            {labels.length > 0 && (
              <div className="flex min-w-0 items-center gap-1 overflow-hidden">
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
        )}
      </footer>
    </article>
  );
};

export default NoteCard;
