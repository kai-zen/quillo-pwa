"use client";

import { Eye } from "lucide-react";
import { cn, IconButton } from "@/components/common";
import {
  formatMoodLabel,
  MOOD_TONE,
  MOOD_TONE_CLASSES,
} from "@/components/daily-reviews/helpers";
import { MoodIcon } from "@/components/daily-reviews/MoodPicker";
import type { DailyReviewMood } from "@/shared/types";
import { formatDayChipDay, formatDayChipWeekday } from "./helpers";

interface DayStripDayCellProps {
  iso: string;
  mood?: DailyReviewMood;
  isSelected: boolean;
  isToday: boolean;
  canOpenReview?: boolean;
  onSelect: (iso: string) => void;
  onOpenReview?: () => void;
}

type MoodToneClasses =
  (typeof MOOD_TONE_CLASSES)[keyof typeof MOOD_TONE_CLASSES];

const DAY_CELL_BASE_CLASSES =
  "group relative my-1 flex h-16 w-14 cursor-pointer flex-col items-center justify-center rounded-2xl border text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background overflow-hidden";

const getDayCellVariantClasses = ({
  isSelected,
  mood,
  toneClasses,
  isToday,
}: {
  isSelected: boolean;
  mood?: DailyReviewMood;
  toneClasses: MoodToneClasses | null;
  isToday: boolean;
}): string => {
  if (isSelected && mood && toneClasses)
    return cn(
      toneClasses.selected,
      "border-transparent shadow-sm ring-2 ring-foreground ring-offset-2 ring-offset-background",
    );

  if (isSelected && !mood)
    return "border-foreground bg-foreground text-background shadow-sm";

  if (!isSelected && mood && toneClasses)
    return cn(
      toneClasses.chip,
      "border-transparent hover:-translate-y-0.5 hover:shadow-sm",
    );

  if (!isSelected && !mood)
    return isToday
      ? "border-foreground/25 bg-accent-soft text-foreground hover:border-foreground/50"
      : "border-transparent text-muted hover:bg-accent-soft hover:text-foreground";

  return "";
};

const DayStripDayCell = ({
  iso,
  mood,
  isSelected,
  isToday,
  canOpenReview = false,
  onSelect,
  onOpenReview,
}: DayStripDayCellProps) => {
  const tone = mood ? MOOD_TONE[mood] : null;
  const toneClasses = tone ? MOOD_TONE_CLASSES[tone] : null;
  const weekday = formatDayChipWeekday(iso);
  const day = formatDayChipDay(iso);

  return (
    <div className="relative">
      {canOpenReview && mood ? (
        <IconButton
          label="Open daily review"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            onOpenReview?.();
          }}
          className={cn(
            "absolute -right-1.5 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface p-0 shadow-sm !rounded-full",
            isSelected
              ? "text-foreground hover:bg-accent-soft"
              : "text-muted hover:bg-accent-soft hover:text-foreground",
          )}
        >
          <Eye className="h-4 w-4" aria-hidden />
        </IconButton>
      ) : null}

      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        aria-current={isToday ? "date" : undefined}
        aria-label={
          mood ? `${weekday} ${day}, mood ${formatMoodLabel(mood)}` : undefined
        }
        onClick={() => onSelect(iso)}
        className={cn(
          DAY_CELL_BASE_CLASSES,
          getDayCellVariantClasses({ isSelected, mood, toneClasses, isToday }),
        )}
      >
        {mood && toneClasses ? (
          <MoodIcon
            mood={mood}
            className={cn(
              "pointer-events-none absolute -left-1.5 -bottom-1.5 h-10 w-10",
              isSelected ? "opacity-20" : cn("opacity-20", toneClasses.icon),
            )}
          />
        ) : null}

        <span
          className={cn(
            "text-xs font-bold uppercase leading-none mt-1",
            isSelected && !mood
              ? "text-background/70"
              : mood
                ? "opacity-70"
                : isToday
                  ? "text-foreground/70"
                  : "text-muted",
          )}
        >
          {weekday}
        </span>
        <span
          className={cn(
            "mt-1 text-xl font-semibold leading-none tabular-nums",
            isSelected && !mood
              ? "text-background"
              : mood
                ? "text-current"
                : isToday
                  ? "text-foreground"
                  : "text-foreground/65",
          )}
        >
          {day}
        </span>
        {isToday ? (
          <span
            aria-hidden
            className={cn(
              "mt-1.5 h-1 w-1 rounded-full",
              isSelected
                ? mood
                  ? "bg-current opacity-70"
                  : "bg-background/80"
                : "bg-foreground",
            )}
          />
        ) : (
          <span className="mt-1.5 h-1 w-1" aria-hidden />
        )}
      </button>
    </div>
  );
};

export default DayStripDayCell;
