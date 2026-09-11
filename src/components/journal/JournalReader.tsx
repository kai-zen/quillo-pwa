"use client";

import { PenLine } from "lucide-react";
import { FC, useState } from "react";
import { cn, IconButton, Markdown, Modal } from "@/components/common";
import DailyReviewForm from "@/components/daily-reviews/DailyReviewForm";
import {
  formatMoodLabel,
  MOOD_TONE,
  MOOD_TONE_CLASSES,
} from "@/components/daily-reviews/helpers";
import { MoodIcon } from "@/components/daily-reviews/MoodPicker";
import useDailyReview from "@/components/daily-reviews/useDailyReview";
import { formatDayHeading } from "@/components/tasks/helpers";

interface Props {
  date: string | null;
  onClose: () => void;
}

type ReaderMode = "read" | "edit";

const JournalReader: FC<Props> = ({ date, onClose }) => {
  const form = useDailyReview(date ?? "");
  const [mode, setMode] = useState<ReaderMode>("read");

  const handleClose = () => {
    if (form.pending) return;
    setMode("read");
    onClose();
  };

  const enterEdit = () => {
    form.openReview();
    setMode("edit");
  };

  const review = form.review;
  const heading = date ? formatDayHeading(date) : "";

  return (
    <Modal
      open={!!date}
      onClose={handleClose}
      title={heading}
      headerActions={
        mode === "read" && review ? (
          <IconButton label="Edit reflection" size="sm" onClick={enterEdit}>
            <PenLine className="h-4 w-4" aria-hidden />
          </IconButton>
        ) : undefined
      }
      className="max-w-2xl sm:max-h-[85vh]"
    >
      {form.isError ? (
        <p className="text-sm text-foreground">
          Could not load this entry. Try refreshing the page.
        </p>
      ) : mode === "edit" ? (
        <DailyReviewForm
          form={form}
          onCancel={() => setMode("read")}
          onSaved={() => setMode("read")}
          submitLabel="Save changes"
        />
      ) : review ? (
        <div className="flex flex-col gap-5 py-1">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                MOOD_TONE_CLASSES[MOOD_TONE[review.mood]].chip,
              )}
            >
              <MoodIcon mood={review.mood} className="h-5 w-5" />
            </span>
            <p className="text-base font-medium text-foreground">
              {formatMoodLabel(review.mood)}
            </p>
          </div>

          {review.journal?.trim() ? (
            <Markdown className="font-journal text-[16px] leading-[1.85] text-foreground">
              {review.journal}
            </Markdown>
          ) : (
            <p className="text-sm italic text-muted">
              No notes were written for this day.
            </p>
          )}
        </div>
      ) : null}
    </Modal>
  );
};

export default JournalReader;
