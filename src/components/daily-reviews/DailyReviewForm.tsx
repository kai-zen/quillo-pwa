"use client";

import { FC } from "react";
import { Button, MarkdownEditor } from "@/components/common";
import MoodPicker from "./MoodPicker";
import type useDailyReview from "./useDailyReview";

interface Props {
  form: ReturnType<typeof useDailyReview>;
  onCancel?: () => void;
  onSaved?: () => void;
  submitLabel?: string;
}

const DailyReviewForm: FC<Props> = ({
  form,
  onCancel,
  onSaved,
  submitLabel = "Save reflection",
}) => {
  const handleSubmit = async (event: SubmitEvent) => {
    const saved = await form.onSubmit(event);
    if (saved) onSaved?.();
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e as unknown as SubmitEvent)}
      className="flex w-full flex-col gap-5"
    >
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">
          How did today feel?
        </p>
        <MoodPicker
          value={form.mood}
          onChange={form.setMood}
          disabled={form.pending}
        />
      </div>

      <div>
        <div className="mb-2">
          <p className="text-sm font-medium text-foreground">Journal</p>
        </div>
        <MarkdownEditor
          value={form.journal}
          onChange={form.setJournal}
          rows={8}
          maxRows={18}
          disabled={form.pending}
          placeholder="What stood out today? Let it out…"
          className="font-journal text-[15px]"
        />
      </div>

      {form.error && <p className="text-sm text-rose-500">{form.error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
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

export default DailyReviewForm;
