"use client";

import { ChevronRight } from "lucide-react";
import { FC } from "react";
import { cn } from "@/components/common";
import {
  formatMoodLabel,
  MOOD_TONE,
  MOOD_TONE_CLASSES,
} from "@/components/daily-reviews/helpers";
import { MoodIcon } from "@/components/daily-reviews/MoodPicker";
import {
  formatDayChipDay,
  formatDayChipMonth,
  formatDayChipWeekday,
} from "@/components/tasks/helpers";
import type { DailyReview } from "@/shared/types";
import { toIsoDay } from "./helpers";

interface Props {
  entry: DailyReview;
  onOpen: () => void;
}

const JournalEntryCard: FC<Props> = ({ entry, onOpen }) => {
  const iso = toIsoDay(entry.date);
  const tone = MOOD_TONE[entry.mood];

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Read journal entry for ${formatDayChipMonth(iso)} ${formatDayChipDay(iso)}`}
      className="group flex w-full cursor-pointer items-start gap-3.5 rounded-2xl border border-border bg-surface px-4 py-3.5 text-left transition-colors hover:border-foreground/30 hover:bg-accent-soft/60"
    >
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-border bg-accent-soft py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          {formatDayChipMonth(iso)}
        </span>
        <span className="text-lg font-semibold leading-none tabular-nums text-foreground">
          {formatDayChipDay(iso)}
        </span>
        <span className="text-[10px] text-muted">
          {formatDayChipWeekday(iso)}
        </span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <span
          className={cn(
            "mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            MOOD_TONE_CLASSES[tone].chip,
          )}
        >
          <MoodIcon mood={entry.mood} className="h-3.5 w-3.5" />
          {formatMoodLabel(entry.mood)}
        </span>
        {entry.journal.trim() ? (
          <p className="font-journal line-clamp-2 text-sm leading-relaxed text-muted">
            {entry.journal}
          </p>
        ) : (
          <p className="text-sm italic text-muted/70">No notes for this day.</p>
        )}
      </div>

      <ChevronRight
        className="mt-1 h-4 w-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </button>
  );
};

export default JournalEntryCard;
