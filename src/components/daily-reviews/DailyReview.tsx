"use client";

import { Smile } from "lucide-react";
import { FC } from "react";
import {
  Button,
  cn,
  Markdown,
  MarkdownEditor,
  Modal,
} from "@/components/common";
import type { DailyReviewMood } from "@/shared/types";
import { formatMoodLabel, MOOD_ICONS, MOOD_OPTIONS } from "./helpers";
import { useDailyReview } from "./useDailyReview";

interface Props {
  date: string;
}

const MoodIcon: FC<{
  mood: DailyReviewMood;
  className?: string;
}> = ({ mood, className }) => {
  const Icon = MOOD_ICONS[mood];
  return (
    <Icon
      className={cn(mood === "grateful" && "fill-current", className)}
      strokeWidth={1.75}
      aria-hidden
    />
  );
};

const MoodPicker: FC<{
  value: DailyReviewMood | "";
  onChange: (mood: DailyReviewMood) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled }) => (
  <div role="radiogroup" aria-label="Mood" className="flex flex-wrap gap-1.5">
    {MOOD_OPTIONS.map((mood) => {
      const selected = value === mood;
      return (
        <button
          key={mood}
          type="button"
          role="radio"
          aria-checked={selected}
          disabled={disabled}
          onClick={() => onChange(mood)}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selected
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface text-muted hover:border-foreground/40 hover:text-foreground",
          )}
        >
          <MoodIcon mood={mood} className="h-3.5 w-3.5" />
          {formatMoodLabel(mood)}
        </button>
      );
    })}
  </div>
);

const DailyReview: FC<Props> = ({ date }) => {
  const form = useDailyReview(date);

  if (!form.reviewable) return null;

  return (
    <>
      {form.filled && form.review ? (
        <div>
          <button
            type="button"
            onClick={form.openReview}
            aria-label={`Edit daily review, mood ${formatMoodLabel(form.review.mood)}`}
            className="flex cursor-pointer items-center gap-2.5 text-left text-foreground transition-opacity hover:opacity-70"
          >
            <MoodIcon mood={form.review.mood} className="h-7 w-7 shrink-0" />
            <span className="text-base font-medium tracking-tight">
              {formatMoodLabel(form.review.mood)}
            </span>
          </button>
          {form.review.journal?.trim() ? (
            <Markdown className="mt-3">{form.review.journal}</Markdown>
          ) : null}
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="self-start px-0"
          onClick={form.openReview}
          aria-label="Add daily review"
        >
          <Smile className="h-4 w-4" aria-hidden />
          Review
        </Button>
      )}

      <Modal
        open={form.open}
        onClose={form.closeReview}
        title="Daily review"
        className="max-w-3xl sm:max-h-[90vh]"
      >
        {form.isError ? (
          <p className="text-sm text-foreground">
            Could not load the review for this day. Try refreshing the page.
          </p>
        ) : (
          <form onSubmit={form.onSubmit} className="flex w-full flex-col gap-3">
            <div>
              <p className="mb-1.5 text-sm text-muted">Mood</p>
              <MoodPicker
                value={form.mood}
                onChange={form.setMood}
                disabled={form.pending}
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm text-muted">Journal</p>
              <MarkdownEditor
                value={form.journal}
                onChange={form.setJournal}
                rows={8}
                maxRows={18}
                disabled={form.pending}
                placeholder="What stood out today?"
              />
            </div>

            {form.error && (
              <p className="text-sm text-rose-500">{form.error}</p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={form.closeReview}
                disabled={form.pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.pending}>
                {form.pending ? "Saving…" : "Save review"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default DailyReview;
