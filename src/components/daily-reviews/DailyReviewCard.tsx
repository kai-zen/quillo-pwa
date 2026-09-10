"use client";

import { Pencil, Plus } from "lucide-react";
import { FC } from "react";
import { Button, cn, Markdown, MarkdownEditor } from "@/components/common";
import type { DailyReviewMood } from "@/shared/types";
import { formatMoodLabel, MOOD_OPTIONS } from "./helpers";
import { useDailyReviewCard } from "./useDailyReviewCard";

interface Props {
  date: string;
}

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
            "cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selected
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-surface text-muted hover:border-foreground/40 hover:text-foreground",
          )}
        >
          {formatMoodLabel(mood)}
        </button>
      );
    })}
  </div>
);

const DailyReviewCard: FC<Props> = ({ date }) => {
  const form = useDailyReviewCard(date);

  if (!form.reviewable) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          Daily review
        </p>
        {!form.writing && form.review && (
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0"
            onClick={form.startWrite}
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </Button>
        )}
        {!form.writing && form.isEmpty && (
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0"
            onClick={form.startWrite}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add review
          </Button>
        )}
      </div>

      {form.isLoading && (
        <p className="text-sm text-muted">Loading review…</p>
      )}

      {form.isError && (
        <p className="text-sm text-foreground">
          Could not load the review for this day. Try refreshing the page.
        </p>
      )}

      {form.writing && (
        <form
          onSubmit={form.onSubmit}
          className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
        >
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
              rows={6}
              maxRows={16}
              disabled={form.pending}
              placeholder="What stood out today?"
            />
          </div>

          {form.error && <p className="text-sm text-rose-500">{form.error}</p>}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={form.cancelWrite}
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

      {!form.writing && form.review && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-1.5 text-sm text-muted">Mood</p>
          {form.review.mood ? (
            <span className="inline-flex rounded-full border border-foreground bg-foreground px-2.5 py-1 text-xs font-medium text-background">
              {formatMoodLabel(form.review.mood)}
            </span>
          ) : (
            <p className="text-sm text-muted">No mood recorded.</p>
          )}
          <p className="mb-1.5 mt-4 text-sm text-muted">Journal</p>
          {form.review.journal?.trim() ? (
            <Markdown compact>{form.review.journal}</Markdown>
          ) : (
            <p className="text-sm text-muted">No journal for this day.</p>
          )}
        </div>
      )}

      {!form.writing && form.isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
          <p className="font-medium text-foreground">No review yet</p>
          <p className="mt-1 text-sm text-muted">
            Capture the mood and a short journal for this day.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={form.startWrite}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            Add review
          </Button>
        </div>
      )}
    </div>
  );
};

export default DailyReviewCard;
