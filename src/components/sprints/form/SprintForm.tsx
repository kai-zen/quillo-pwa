"use client";

import { FC, useId } from "react";
import {
  Button,
  DatePicker,
  Field,
  Input,
  MarkdownEditor,
  Select,
} from "@/components/common";
import {
  SPRINT_STATUS_LABELS,
  SPRINT_STATUS_OPTIONS,
} from "../helpers";
import { useSprintForm, type SprintFormMode } from "./useSprintForm";

export type { SprintFormMode };

interface Props {
  mode: SprintFormMode;
  onClose: () => void;
  onSaved: (result?: { deleted?: boolean }) => void;
}

const SprintForm: FC<Props> = ({ mode, onClose, onSaved }) => {
  const nameId = useId();
  const form = useSprintForm(mode, onSaved);

  return (
    <form onSubmit={form.onSubmit} className="flex w-full flex-col gap-3">
      <p className="text-sm text-muted">
        {form.editing
          ? "Update this sprint’s details."
          : "Create a timeboxed bucket for related work."}
      </p>

      <Field label="Name" htmlFor={nameId}>
        <Input
          id={nameId}
          value={form.name}
          onChange={(event) => form.setName(event.target.value)}
          required
          maxLength={120}
          autoFocus
          placeholder="Sprint name"
        />
      </Field>

      <Field label="Description">
        <MarkdownEditor
          value={form.description}
          onChange={form.setDescription}
          rows={4}
          placeholder="Goal or notes for this sprint…"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Start date">
          <DatePicker
            value={form.startDate}
            onChange={form.setStartDate}
            required
            clearable={false}
            max={form.endDate || undefined}
            aria-label="Sprint start date"
          />
        </Field>
        <Field label="End date">
          <DatePicker
            value={form.endDate}
            onChange={form.setEndDate}
            required
            clearable={false}
            min={form.startDate || undefined}
            aria-label="Sprint end date"
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
            aria-label="Sprint status"
          >
            {SPRINT_STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {SPRINT_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
      )}

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
              : "Create sprint"}
        </Button>
      </div>
    </form>
  );
};

export default SprintForm;

export function sprintFormTitle(mode: SprintFormMode): string {
  return mode.type === "edit" ? "Edit sprint" : "New sprint";
}
