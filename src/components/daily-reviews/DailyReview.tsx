"use client";

import { BookHeart, ChevronRight, Moon, PenLine } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { cn, Markdown } from "@/components/common";
import DailyReviewModal from "./DailyReviewModal";
import { formatMoodLabel, MOOD_TONE, MOOD_TONE_CLASSES } from "./helpers";
import { MoodIcon } from "./MoodPicker";
import { useDailyReview } from "./useDailyReview";

interface Props {
  date: string;
}

const DailyReview: FC<Props> = ({ date }) => {
  const form = useDailyReview(date);

  if (!form.reviewable) return null;

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface px-4 py-3.5">
        {form.filled && form.review ? (
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={form.openReview}
              aria-label={`Edit daily review, mood ${formatMoodLabel(form.review.mood)}`}
              className="group flex w-full cursor-pointer items-center justify-between gap-2 text-left"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  MOOD_TONE_CLASSES[MOOD_TONE[form.review.mood]].chip,
                )}
              >
                <MoodIcon mood={form.review.mood} className="h-3.5 w-3.5" />
                {formatMoodLabel(form.review.mood)}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
                <PenLine className="h-3 w-3" aria-hidden />
                Edit
              </span>
            </button>

            {form.review.journal?.trim() ? (
              <Markdown
                className="font-journal text-[15px] leading-relaxed"
                compact
              >
                {form.review.journal}
              </Markdown>
            ) : (
              <p className="text-sm italic text-muted">No notes for today.</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={form.openReview}
            aria-label="Add daily review"
            className="group flex w-full cursor-pointer items-center gap-3 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
              <Moon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">
                How was today?
              </span>
              <span className="block text-xs text-muted">
                Take a moment to reflect before you close the day.
              </span>
            </span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        )}
      </div>

      <DailyReviewModal date={date} form={form} />
    </>
  );
};

export default DailyReview;
