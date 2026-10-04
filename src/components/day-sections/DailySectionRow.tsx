"use client";

import { ChevronDown, GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  ButtonHTMLAttributes,
  FC,
  KeyboardEvent,
  useEffect,
  useId,
  useState,
} from "react";
import { IconButton, Input, cn } from "@/components/common";
import type { DailySection } from "@/shared/types";
import { sectionDisplayTitle } from "./helpers";

interface Props {
  section: DailySection;
  editing: boolean;
  pending: boolean;
  collapsed?: boolean;
  reorderHandle?:
    | (ButtonHTMLAttributes<HTMLButtonElement> & {
        dragging?: boolean;
      })
    | null;
  onStartEdit: () => void;
  onSaveTitle: (title: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onToggleCollapse?: () => void;
}

const DailySectionRow: FC<Props> = ({
  section,
  editing,
  pending,
  collapsed = false,
  reorderHandle,
  onStartEdit,
  onSaveTitle,
  onCancelEdit,
  onDelete,
  onToggleCollapse,
}) => {
  const inputId = useId();
  const [draftTitle, setDraftTitle] = useState(section.title);
  const { dragging: reorderDragging, ...reorderHandleProps } =
    reorderHandle ?? {};

  useEffect(() => {
    if (!editing) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftTitle(section.title);
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    input?.focus({ preventScroll: true });
    input?.select();
  }, [editing, inputId, section.title]);

  const commitTitle = () => onSaveTitle(draftTitle);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitTitle();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onCancelEdit();
    }
  };

  return (
    <div
      className={cn(
        "group/section flex items-center gap-1 py-1",
        reorderDragging && "opacity-40",
      )}
    >
      {reorderHandle ? (
        <button
          type="button"
          aria-label={`Reorder ${sectionDisplayTitle(section.title)}`}
          className="cursor-grab touch-none rounded-md p-1 text-muted hover:bg-accent-soft hover:text-foreground active:cursor-grabbing"
          {...reorderHandleProps}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
      ) : (
        <span className="w-6 shrink-0" aria-hidden />
      )}

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {editing ? (
          <Input
            id={inputId}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={onKeyDown}
            maxLength={120}
            disabled={pending}
            placeholder="07:00, Morning, Work…"
            className="h-8 flex-1 text-sm"
            aria-label="Section title"
          />
        ) : (
          <>
            <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
              {sectionDisplayTitle(section.title)}
            </span>
            <span className="h-px min-w-0 flex-1 bg-border" aria-hidden />
          </>
        )}
      </div>

      {editing ? (
        <IconButton
          label={`Delete ${sectionDisplayTitle(section.title)}`}
          size="sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onDelete}
          disabled={pending}
          className="shrink-0 text-rose-700 hover:bg-rose-500/10 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
      ) : (
        <div className="flex shrink-0 items-center">
          <IconButton
            label={`Edit ${sectionDisplayTitle(section.title)}`}
            size="sm"
            onClick={onStartEdit}
            disabled={pending}
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
        </div>
      )}

      {!editing && onToggleCollapse ? (
        <IconButton
          label={
            collapsed
              ? `Expand ${sectionDisplayTitle(section.title)}`
              : `Collapse ${sectionDisplayTitle(section.title)}`
          }
          size="sm"
          onClick={onToggleCollapse}
          disabled={pending}
          aria-expanded={!collapsed}
          className="shrink-0"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              !collapsed && "rotate-180",
            )}
            aria-hidden
          />
        </IconButton>
      ) : null}
    </div>
  );
};

export default DailySectionRow;
