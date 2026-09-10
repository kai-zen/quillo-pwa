"use client";

import { Plus, X } from "lucide-react";
import { FC, useState } from "react";
import { Button, ConfirmModal, IconButton } from "@/components/common";
import {
  formatProgressDetails,
  PROGRESS_INPUT_TYPE_LABELS,
} from "@/components/progresses/helpers";
import type { Progress, RecordId } from "@/shared/types";

interface Props {
  progresses: Progress[];
  isLoading?: boolean;
  isError?: boolean;
  pendingId?: RecordId | null;
  onAdd: () => void;
  onRemove: (progress: Progress) => void;
}

const SprintProgresses: FC<Props> = ({
  progresses,
  isLoading,
  isError,
  pendingId,
  onAdd,
  onRemove,
}) => {
  const count = progresses.length;
  const [toRemove, setToRemove] = useState<Progress | null>(null);

  const confirmRemove = () => {
    if (!toRemove || pendingId) return;
    const progress = toRemove;
    setToRemove(null);
    onRemove(progress);
  };

  const isEmpty = !isLoading && !isError && count === 0;
  const hasItems = !isLoading && !isError && count > 0;

  return (
    <div className="my-8 flex min-w-0 w-full flex-col gap-3">
      <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">Progress Trackers</p>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium tabular-nums text-muted">
            {count} tracker{count === 1 ? "" : "s"}
          </span>
          <Button size="sm" variant="secondary" onClick={onAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Add progress
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted">Loading progress…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load progress. Try refreshing the page.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
          <p className="font-medium text-foreground">
            No progress trackers on this sprint
          </p>
          <p className="mt-1 text-sm text-muted">
            Add existing trackers to follow during this sprint.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={onAdd}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            Add progress
          </Button>
        </div>
      )}

      {hasItems && (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {progresses.map((progress) => {
            const typeLabel = PROGRESS_INPUT_TYPE_LABELS[progress.input_type];
            const details = formatProgressDetails(progress);
            const meta =
              details === "—" ? typeLabel : `${typeLabel} · ${details}`;

            return (
              <li
                key={progress._id}
                className="flex items-start gap-2 px-3 py-2.5 odd:bg-accent-soft/55 even:bg-surface"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {progress.title}
                  </p>
                  {progress.description ? (
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {progress.description}
                    </p>
                  ) : null}
                  <p className="mt-0.5 truncate text-xs text-muted">{meta}</p>
                </div>
                <IconButton
                  label={`Remove ${progress.title} from this sprint`}
                  size="sm"
                  className="shrink-0"
                  disabled={!!pendingId}
                  onClick={() => setToRemove(progress)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmModal
        open={!!toRemove}
        title="Remove progress"
        description={
          toRemove
            ? `Remove “${toRemove.title}” from this sprint? The tracker itself stays and can be added again later.`
            : undefined
        }
        confirmLabel="Remove"
        onClose={() => setToRemove(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
};

export default SprintProgresses;
