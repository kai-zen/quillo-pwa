"use client";

import { FC } from "react";
import { cn } from "@/components/common";
import type { DailyReviewMood } from "@/shared/types";
import {
  formatMoodLabel,
  MOOD_ICONS,
  MOOD_OPTIONS,
  MOOD_TONE,
  MOOD_TONE_CLASSES,
  MOOD_TONE_LABEL,
  type MoodTone,
} from "./helpers";

export const MoodIcon: FC<{
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

const TONE_ORDER: MoodTone[] = ["low", "neutral", "high"];

interface Props {
  value: DailyReviewMood | "";
  onChange: (mood: DailyReviewMood) => void;
  disabled?: boolean;
}

const MoodPicker: FC<Props> = ({ value, onChange, disabled }) => (
  <div className="flex flex-col gap-3">
    {TONE_ORDER.map((tone) => {
      const moods = MOOD_OPTIONS.filter((mood) => MOOD_TONE[mood] === tone);
      const toneClasses = MOOD_TONE_CLASSES[tone];

      return (
        <div key={tone}>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted/70">
            {MOOD_TONE_LABEL[tone]}
          </p>
          <div
            role="radiogroup"
            aria-label={`${MOOD_TONE_LABEL[tone]} moods`}
            className="flex flex-wrap gap-1.5"
          >
            {moods.map((mood) => {
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
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    selected
                      ? cn("scale-105 shadow-sm", toneClasses.selected)
                      : "border-border bg-surface text-muted hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  <MoodIcon
                    mood={mood}
                    className={cn("h-3.5 w-3.5", !selected && toneClasses.icon)}
                  />
                  {formatMoodLabel(mood)}
                </button>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

export default MoodPicker;
