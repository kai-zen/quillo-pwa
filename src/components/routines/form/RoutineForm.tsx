"use client";

import { FC, useId } from "react";
import { Button, Field, Input, Select, cn } from "@/components/common";
import { LabelManagerModal } from "@/components/labels";
import type { Label, RoutineRepeat } from "@/shared/types";
import { DAYS_OF_WEEK } from "@/shared/types";
import {
  DAY_SHORT_LABELS,
  REPEAT_LABELS,
  REPEAT_OPTIONS,
} from "../helpers";
import RoutineDraftsEditor from "./RoutineDraftsEditor";
import { useRoutineForm, type RoutineFormMode } from "./useRoutineForm";

export type { RoutineFormMode };

interface Props {
  mode: RoutineFormMode;
  labels: Label[];
  onClose: () => void;
  onSaved: (result?: { deleted?: boolean }) => void;
}

const RoutineForm: FC<Props> = ({ mode, labels, onClose, onSaved }) => {
  const nameId = useId();
  const form = useRoutineForm(mode, onSaved);

  return (
    <>
      <form onSubmit={form.onSubmit} className="flex w-full flex-col gap-3">
        <p className="text-sm text-muted">
          {form.editing
            ? "Update this routine and the tasks it should create."
            : "Save a set of drafts you can drop onto any day."}
        </p>

        <Field label="Name" htmlFor={nameId}>
          <Input
            id={nameId}
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
            required
            maxLength={120}
            autoFocus
            placeholder="Morning, gym, university…"
          />
        </Field>

        <Field label="Repeat">
          <Select
            value={form.repeat}
            onChange={(event) =>
              form.setRepeat(event.target.value as RoutineRepeat)
            }
            aria-label="How often this routine repeats"
          >
            {REPEAT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {REPEAT_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>

        {form.repeat === "weekly" && (
          <div>
            <span className="mb-1.5 block text-sm text-muted">Days</span>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const selected = form.daysOfWeek.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => form.toggleDay(day)}
                    className={cn(
                      "cursor-pointer rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                      selected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted hover:text-foreground",
                    )}
                  >
                    {DAY_SHORT_LABELS[day]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <RoutineDraftsEditor
          drafts={form.drafts}
          labels={labels}
          disabled={form.pending}
          onAdd={form.addDraft}
          onRemove={form.removeDraft}
          onUpdate={form.updateDraft}
          onCreateLabel={form.openLabelCreate}
        />

        {form.error && <p className="text-sm text-rose-500">{form.error}</p>}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {form.editing && (
            <Button
              variant="ghost"
              className="mr-auto hover:text-rose-500"
              onClick={form.onDelete}
              disabled={form.pending}
            >
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={form.pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.pending}>
            {form.pending
              ? "Saving…"
              : form.editing
                ? "Save changes"
                : "Create routine"}
          </Button>
        </div>
      </form>

      <LabelManagerModal
        open={form.labelManagerOpen}
        labels={labels}
        initialName={form.labelDraftName}
        onClose={form.closeLabelManager}
        onCreated={(label) => form.onLabelCreated(label._id)}
        onDeleted={form.onLabelDeleted}
      />
    </>
  );
};

export default RoutineForm;

export function routineFormTitle(mode: RoutineFormMode): string {
  return mode.type === "edit" ? "Edit routine" : "New routine";
}
