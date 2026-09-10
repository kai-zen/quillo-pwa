"use client";

import { FC, useId, useState } from "react";
import {
  Button,
  ConfirmModal,
  DatePicker,
  Field,
  Input,
  MarkdownEditor,
  Select,
} from "@/components/common";
import { GOAL_STATUS_LABELS, GOAL_STATUS_OPTIONS } from "../helpers";
import GoalObjectivesEditor from "./GoalObjectivesEditor";
import { useGoalForm, type GoalFormMode } from "./useGoalForm";

export type { GoalFormMode };

interface Props {
  mode: GoalFormMode;
  onClose: () => void;
  onSaved: (result?: { deleted?: boolean }) => void;
}

const GoalForm: FC<Props> = ({ mode, onClose, onSaved }) => {
  const titleId = useId();
  const form = useGoalForm(mode, onSaved);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <form
        onSubmit={(e) => form.onSubmit(e as unknown as SubmitEvent)}
        className="flex w-full flex-col gap-3"
      >
        <p className="text-sm text-muted">
          {form.editing
            ? "Update this goal and its objectives."
            : "Define a longer-term outcome and optional checklist steps."}
        </p>

        <Field label="Title" htmlFor={titleId}>
          <Input
            id={titleId}
            value={form.title}
            onChange={(event) => form.setTitle(event.target.value)}
            required
            maxLength={200}
            autoFocus
            placeholder="Goal title"
          />
        </Field>

        <Field label="Description">
          <MarkdownEditor
            value={form.description}
            onChange={form.setDescription}
            rows={4}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Start date">
            <DatePicker
              value={form.startDate}
              onChange={form.setStartDate}
              clearable
              max={form.targetDate || undefined}
              aria-label="Goal start date"
            />
          </Field>
          <Field label="Target date">
            <DatePicker
              value={form.targetDate}
              onChange={form.setTargetDate}
              clearable
              min={form.startDate || undefined}
              aria-label="Goal target date"
            />
          </Field>
        </div>

        {form.editing && (
          <Field label="Status">
            <Select
              value={form.status}
              onChange={(event) =>
                form.setStatus(event.target.value as typeof form.status)
              }
              aria-label="Goal status"
            >
              {GOAL_STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {GOAL_STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <GoalObjectivesEditor
          objectives={form.objectives}
          disabled={form.pending}
          onAdd={form.addObjective}
          onRemove={form.removeObjective}
          onUpdate={form.updateObjective}
        />

        {form.error && <p className="text-sm text-rose-500">{form.error}</p>}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {form.editing && (
            <Button
              variant="ghost"
              className="mr-auto hover:text-rose-500"
              onClick={() => setConfirmDelete(true)}
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
                : "Create goal"}
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={confirmDelete}
        title="Delete goal"
        description={
          form.editing
            ? `Delete “${form.editing.title}”? Linked sprints keep their tasks but lose this goal.`
            : undefined
        }
        confirmLabel="Delete"
        pending={form.pending}
        pendingLabel="Deleting…"
        onClose={() => setConfirmDelete(false)}
        onConfirm={form.onDelete}
      />
    </>
  );
};

export default GoalForm;

export function goalFormTitle(mode: GoalFormMode): string {
  return mode.type === "edit" ? "Edit goal" : "New goal";
}
