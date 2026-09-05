"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { FC, KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Field,
  IconButton,
  Input,
  MarkdownEditor,
  Select,
  cn,
} from "@/components/common";
import { LabelField } from "@/components/labels";
import { PRIORITY_LABELS, PRIORITY_OPTIONS } from "@/components/tasks/helpers";
import type { Label, RecordId, TaskPriority } from "@/shared/types";
import type { DraftFormItem } from "./useRoutineForm";

interface Props {
  drafts: DraftFormItem[];
  labels: Label[];
  disabled?: boolean;
  onAdd: () => string;
  onRemove: (key: string) => void;
  onUpdate: (key: string, patch: Partial<DraftFormItem>) => void;
  onCreateLabel: (draftKey: string, draftName: string) => void;
}

const RoutineDraftsEditor: FC<Props> = ({
  drafts,
  labels,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
  onCreateLabel,
}) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(
    () => drafts.find((draft) => !draft.title.trim())?.key ?? null,
  );
  const [focusTick, setFocusTick] = useState(0);
  const pendingFocusKey = useRef<string | null>(null);

  const addDraft = () => {
    const key = onAdd();
    pendingFocusKey.current = key;
    setExpandedKey(key);
    setFocusTick((tick) => tick + 1);
  };

  useLayoutEffect(() => {
    const key = pendingFocusKey.current;
    if (!key) return;
    pendingFocusKey.current = null;
    document
      .getElementById(`routine-draft-title-${key}`)
      ?.focus({ preventScroll: true });
    document.getElementById(`routine-draft-${key}`)?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [focusTick]);

  const removeDraft = (key: string) => {
    if (expandedKey === key) {
      const remaining = drafts.filter((draft) => draft.key !== key);
      setExpandedKey(remaining.at(-1)?.key ?? null);
    }
    onRemove(key);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Drafts</p>
        <span className="text-xs font-medium tabular-nums text-muted">
          {drafts.length}
        </span>
      </div>

      {drafts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Add drafts to turn this routine into tasks.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {drafts.map((draft, index) => (
            <DraftCard
              key={draft.key}
              index={index}
              draft={draft}
              labels={labels}
              disabled={disabled}
              expanded={expandedKey === draft.key}
              onToggle={() =>
                setExpandedKey((current) =>
                  current === draft.key ? null : draft.key,
                )
              }
              onRemove={() => removeDraft(draft.key)}
              onUpdate={(patch) => onUpdate(draft.key, patch)}
              onCreateLabel={(name) => onCreateLabel(draft.key, name)}
              onAddNext={addDraft}
            />
          ))}
        </ul>
      )}

      <Button
        variant="secondary"
        onClick={addDraft}
        disabled={disabled}
        startIcon={<Plus className="h-3.5 w-3.5" aria-hidden />}
        className="w-full border-dashed"
      >
        Add draft
      </Button>
    </div>
  );
};

interface DraftCardProps {
  index: number;
  draft: DraftFormItem;
  labels: Label[];
  disabled?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<DraftFormItem>) => void;
  onCreateLabel: (draftName: string) => void;
  onAddNext: () => void;
}

const draftSummary = (draft: DraftFormItem) =>
  [
    draft.priority !== "unset" ? PRIORITY_LABELS[draft.priority] : null,
    draft.labelIds.length > 0
      ? `${draft.labelIds.length} label${draft.labelIds.length === 1 ? "" : "s"}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

const DraftCard: FC<DraftCardProps> = ({
  index,
  draft,
  labels,
  disabled,
  expanded,
  onToggle,
  onRemove,
  onUpdate,
  onCreateLabel,
  onAddNext,
}) => {
  const titleId = `routine-draft-title-${draft.key}`;
  const fieldsId = `routine-draft-fields-${draft.key}`;
  const title = draft.title.trim();
  const summary = draftSummary(draft);

  const onTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (draft.title.trim()) onAddNext();
  };

  return (
    <li
      id={`routine-draft-${draft.key}`}
      className="rounded-xl border border-border"
    >
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={expanded ? fieldsId : undefined}
          disabled={disabled}
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-accent-soft/60 disabled:cursor-not-allowed"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm font-medium",
              title ? "text-foreground" : "text-muted",
            )}
          >
            {title || `Draft ${index + 1}`}
          </span>
          {!expanded && summary ? (
            <span className="hidden shrink-0 text-xs text-muted sm:inline">
              {summary}
            </span>
          ) : null}
        </button>
        <IconButton
          label={`Remove draft ${index + 1}`}
          size="sm"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
      </div>

      {expanded && (
        <div
          id={fieldsId}
          className="flex flex-col gap-3 border-t border-border px-3 py-3"
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <Field label="Title" htmlFor={titleId}>
              <Input
                id={titleId}
                value={draft.title}
                onChange={(event) => onUpdate({ title: event.target.value })}
                onKeyDown={onTitleKeyDown}
                maxLength={200}
                placeholder="Task title"
                disabled={disabled}
              />
            </Field>
            <Field label="Priority">
              <Select
                value={draft.priority}
                onChange={(event) =>
                  onUpdate({ priority: event.target.value as TaskPriority })
                }
                disabled={disabled}
                aria-label={`Draft ${index + 1} priority`}
              >
                {PRIORITY_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABELS[value]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Description">
            <MarkdownEditor
              value={draft.description}
              onChange={(description) => onUpdate({ description })}
              rows={2}
              maxRows={4}
              compact
              placeholder="Notes for this task…"
              disabled={disabled}
            />
          </Field>

          <LabelField
            labels={labels}
            selectedIds={draft.labelIds}
            onChange={(labelIds: RecordId[]) => onUpdate({ labelIds })}
            onCreate={onCreateLabel}
          />
        </div>
      )}
    </li>
  );
};

export default RoutineDraftsEditor;
