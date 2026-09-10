"use client";

import { Plus, Trash2 } from "lucide-react";
import { FC, useId } from "react";
import {
  Button,
  Field,
  IconButton,
  Input,
  Select,
  Textarea,
} from "@/components/common";
import type { ProgressInputType } from "@/shared/types";
import {
  PROGRESS_INPUT_TYPE_HINTS,
  PROGRESS_INPUT_TYPE_LABELS,
  PROGRESS_INPUT_TYPE_OPTIONS,
} from "../helpers";
import { useProgressForm, type ProgressFormMode } from "./useProgressForm";

export type { ProgressFormMode };

interface Props {
  mode: ProgressFormMode;
  onClose: () => void;
  onSaved: (result?: { deleted?: boolean }) => void;
}

const ProgressForm: FC<Props> = ({ mode, onClose, onSaved }) => {
  const titleId = useId();
  const form = useProgressForm(mode, onSaved);
  const showChoiceOptions = form.inputType === "choice";
  const showNumberRange =
    form.inputType === "number" || form.inputType === "rating";

  return (
    <form onSubmit={form.onSubmit} className="flex w-full flex-col gap-3">
      <p className="text-sm text-muted">
        {form.editing
          ? "Update this tracker. Input type cannot change once values have been recorded."
          : "Define a reusable tracker you can fill in day by day."}
      </p>

      <Field label="Title" htmlFor={titleId}>
        <Input
          id={titleId}
          value={form.title}
          onChange={(event) => form.setTitle(event.target.value)}
          required
          maxLength={200}
          autoFocus
          placeholder="Pages read, workout, mood…"
          disabled={form.pending}
        />
      </Field>

      <Field label="Description">
        <Textarea
          value={form.description}
          onChange={(event) => form.setDescription(event.target.value)}
          rows={3}
          maxRows={6}
          placeholder="Optional notes about what this tracks"
          disabled={form.pending}
        />
      </Field>

      <Field label="Input type">
        <Select
          value={form.inputType}
          onChange={(event) =>
            form.setInputType(event.target.value as ProgressInputType)
          }
          aria-label="Progress input type"
          disabled={form.pending}
        >
          {PROGRESS_INPUT_TYPE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {PROGRESS_INPUT_TYPE_LABELS[value]}
            </option>
          ))}
        </Select>
        <p className="mt-1.5 text-xs text-muted">
          {PROGRESS_INPUT_TYPE_HINTS[form.inputType]}
        </p>
      </Field>

      {showNumberRange && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Min">
            <Input
              type="number"
              inputMode="decimal"
              step={form.inputType === "rating" ? "1" : "any"}
              value={form.rangeMin}
              onChange={(event) => form.setRangeMin(event.target.value)}
              required
              placeholder={form.inputType === "rating" ? "1" : "0"}
              disabled={form.pending}
              aria-label="Minimum value"
            />
          </Field>
          <Field label="Max">
            <Input
              type="number"
              inputMode="decimal"
              step={form.inputType === "rating" ? "1" : "any"}
              value={form.rangeMax}
              onChange={(event) => form.setRangeMax(event.target.value)}
              required
              placeholder={form.inputType === "rating" ? "5" : "100"}
              disabled={form.pending}
              aria-label="Maximum value"
            />
          </Field>
        </div>
      )}

      {showChoiceOptions && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Options</p>
          <ul className="flex flex-col gap-2">
            {form.choiceOptions.map((option, index) => (
              <li key={option.key} className="flex items-center gap-2">
                <Input
                  value={option.value}
                  onChange={(event) =>
                    form.updateChoiceOption(option.key, event.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  disabled={form.pending}
                  aria-label={`Choice option ${index + 1}`}
                />
                <IconButton
                  label={`Remove option ${index + 1}`}
                  size="sm"
                  onClick={() => form.removeChoiceOption(option.key)}
                  disabled={form.pending}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </IconButton>
              </li>
            ))}
          </ul>
          <Button
            variant="secondary"
            onClick={form.addChoiceOption}
            disabled={form.pending}
            startIcon={<Plus className="h-3.5 w-3.5" aria-hidden />}
            className="w-full border-dashed"
          >
            Add option
          </Button>
        </div>
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
              : "Create progress"}
        </Button>
      </div>
    </form>
  );
};

export default ProgressForm;

export function progressFormTitle(mode: ProgressFormMode): string {
  return mode.type === "edit" ? "Edit progress" : "New progress";
}
