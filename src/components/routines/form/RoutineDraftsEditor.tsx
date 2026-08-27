"use client";

import { Plus, Trash2 } from "lucide-react";
import { FC } from "react";
import {
  Button,
  Field,
  IconButton,
  Input,
  Select,
  Textarea,
} from "@/components/common";
import { LabelField } from "@/components/labels";
import { PRIORITY_LABELS, PRIORITY_OPTIONS } from "@/components/tasks/helpers";
import type { Label, RecordId, TaskPriority } from "@/shared/types";
import type { DraftFormItem } from "./useRoutineForm";

interface Props {
  drafts: DraftFormItem[];
  labels: Label[];
  disabled?: boolean;
  onAdd: () => void;
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
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Drafts</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdd}
          disabled={disabled}
          startIcon={<Plus className="h-3.5 w-3.5" aria-hidden />}
        >
          Add draft
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted">
            No drafts yet. Add one to turn this routine into tasks.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {drafts.map((draft, index) => (
            <DraftCard
              key={draft.key}
              index={index}
              draft={draft}
              labels={labels}
              disabled={disabled}
              onRemove={() => onRemove(draft.key)}
              onUpdate={(patch) => onUpdate(draft.key, patch)}
              onCreateLabel={(name) => onCreateLabel(draft.key, name)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

interface DraftCardProps {
  index: number;
  draft: DraftFormItem;
  labels: Label[];
  disabled?: boolean;
  onRemove: () => void;
  onUpdate: (patch: Partial<DraftFormItem>) => void;
  onCreateLabel: (draftName: string) => void;
}

const DraftCard: FC<DraftCardProps> = ({
  index,
  draft,
  labels,
  disabled,
  onRemove,
  onUpdate,
  onCreateLabel,
}) => {
  const titleId = `routine-draft-title-${draft.key}`;

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Draft {index + 1}
        </p>
        <IconButton
          label={`Remove draft ${index + 1}`}
          size="sm"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
      </div>

      <Field label="Title" htmlFor={titleId}>
        <Input
          id={titleId}
          value={draft.title}
          onChange={(event) => onUpdate({ title: event.target.value })}
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

      <Field label="Description">
        <Textarea
          value={draft.description}
          onChange={(event) => onUpdate({ description: event.target.value })}
          rows={2}
          maxRows={6}
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
    </li>
  );
};

export default RoutineDraftsEditor;
