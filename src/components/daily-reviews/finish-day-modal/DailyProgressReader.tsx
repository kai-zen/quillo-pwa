"use client";

import { PenLine } from "lucide-react";
import { FC } from "react";
import { IconButton } from "@/components/common";
import type { Progress } from "@/shared/types";
import { formatProgressValue } from "../daily-progress-inputs-form/formatProgressValue";
import type { ProgressDraftValue } from "../daily-progress-inputs-form/useDailyProgressInputs";

interface Props {
  progresses: Progress[];
  values: Record<string, ProgressDraftValue>;
  isLoading?: boolean;
  isError?: boolean;
  onEdit: () => void;
}

const DailyProgressReader: FC<Props> = ({
  progresses,
  values,
  isLoading,
  isError,
  onEdit,
}) => {
  if (isLoading) {
    return <p className="text-sm text-muted">Loading progress trackers…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-foreground">
        Could not load progress for this day. Try refreshing the page.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <IconButton label="Edit progress" size="sm" onClick={onEdit}>
          <PenLine className="h-4 w-4" aria-hidden />
        </IconButton>
      </div>

      <ul className="flex flex-col gap-3">
        {progresses.map((progress) => {
          const formatted = formatProgressValue(
            progress,
            values[progress._id] ?? null,
          );

          return (
            <li
              key={progress._id}
              className="rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {progress.title}
                  </p>
                  {progress.description ? (
                    <p className="mt-0.5 text-sm text-muted">
                      {progress.description}
                    </p>
                  ) : null}
                </div>
                <p
                  className={
                    formatted
                      ? "shrink-0 text-sm font-medium tabular-nums text-foreground"
                      : "shrink-0 text-sm italic text-muted"
                  }
                >
                  {formatted ?? "Not logged"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DailyProgressReader;
