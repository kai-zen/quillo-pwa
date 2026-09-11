"use client";

import { FC } from "react";
import { Button, Field } from "@/components/common";
import type { Progress } from "@/shared/types";
import ProgressValueField from "./ProgressValueField";
import type useDailyProgressInputs from "./useDailyProgressInputs";

interface Props {
  dateLabel: string;
  progresses: Progress[];
  form: ReturnType<typeof useDailyProgressInputs>;
  onCancel?: () => void;
  onBack?: () => void;
  onSaved?: () => void;
  submitLabel?: string;
}

const DailyProgressInputsForm: FC<Props> = ({
  progresses,
  form,
  onCancel,
  onBack,
  onSaved,
  submitLabel = "Save progress",
}) => {
  const handleSubmit = async (event: SubmitEvent) => {
    const saved = await form.onSubmit(event);
    if (saved) onSaved?.();
  };

  if (form.isLoading) {
    return <p className="text-sm text-muted">Loading progress trackers…</p>;
  }

  if (form.isError) {
    return (
      <p className="text-sm text-foreground">
        Could not load progress for this day. Try refreshing the page.
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => handleSubmit(event as unknown as SubmitEvent)}
      className="flex w-full flex-col gap-5"
    >
      <p className="text-sm text-muted">
        Log today&apos;s values for the trackers on your active sprint.
      </p>

      <ul className="flex flex-col gap-4">
        {progresses.map((progress) => (
          <li
            key={progress._id}
            className="rounded-xl border border-border bg-surface px-4 py-3"
          >
            <Field label={progress.title}>
              {progress.description ? (
                <p className="mb-2 text-sm text-muted">{progress.description}</p>
              ) : null}
              <ProgressValueField
                progress={progress}
                value={form.values[progress._id] ?? null}
                disabled={form.pending}
                onChange={(value) => form.setValue(progress._id, value)}
              />
            </Field>
          </li>
        ))}
      </ul>

      {form.error && <p className="text-sm text-rose-500">{form.error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {onBack ? (
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={form.pending}
            className="mr-auto"
          >
            Back
          </Button>
        ) : null}
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} disabled={form.pending}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={form.pending}>
          {form.pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default DailyProgressInputsForm;
