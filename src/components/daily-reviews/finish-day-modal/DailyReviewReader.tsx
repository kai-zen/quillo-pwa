"use client";

import { PenLine } from "lucide-react";
import { FC } from "react";
import { cn, IconButton, Markdown } from "@/components/common";
import type { DailyReviewMood } from "@/shared/types";
import { formatMoodLabel, MOOD_TONE, MOOD_TONE_CLASSES } from "../helpers";
import { MoodIcon } from "../MoodPicker";

interface Props {
  mood: DailyReviewMood;
  journal: string;
  onEdit: () => void;
}

const DailyReviewReader: FC<Props> = ({ mood, journal, onEdit }) => (
  <div className="flex flex-col gap-4">
    <div className="flex items-start justify-between gap-3">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          MOOD_TONE_CLASSES[MOOD_TONE[mood]].chip,
        )}
      >
        <MoodIcon mood={mood} className="h-3.5 w-3.5" />
        {formatMoodLabel(mood)}
      </span>
      <IconButton label="Edit reflection" size="sm" onClick={onEdit}>
        <PenLine className="h-4 w-4" aria-hidden />
      </IconButton>
    </div>

    {journal.trim() ? (
      <Markdown className="font-journal text-[15px] leading-relaxed" compact>
        {journal}
      </Markdown>
    ) : (
      <p className="text-sm italic text-muted">No notes for this day.</p>
    )}
  </div>
);

export default DailyReviewReader;
