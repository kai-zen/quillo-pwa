"use client";

import { Plus, X } from "lucide-react";
import { FC, useState } from "react";
import {
  Button,
  IconButton,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common";
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

  return (
    <div className="flex min-w-0 flex-col gap-3 my-8">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
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

      {!isLoading && !isError && count === 0 && (
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

      {!isLoading && !isError && count > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead className="w-64">Details</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progresses.map((progress) => (
              <TableRow key={progress._id}>
                <TableCell>
                  <span className="block truncate font-medium text-foreground">
                    {progress.title}
                  </span>
                  {progress.description ? (
                    <span className="mt-0.5 block truncate text-sm text-muted">
                      {progress.description}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <span className="text-sm whitespace-nowrap text-muted">
                    {PROGRESS_INPUT_TYPE_LABELS[progress.input_type]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="block truncate text-sm text-muted">
                    {formatProgressDetails(progress)}
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton
                    label={`Remove ${progress.title} from this sprint`}
                    size="sm"
                    disabled={!!pendingId}
                    onClick={() => setToRemove(progress)}
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        title="Remove progress"
        className="max-w-md"
      >
        {toRemove && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              Remove “{toRemove.title}” from this sprint? The tracker itself
              stays and can be added again later.
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setToRemove(null)}>
                Cancel
              </Button>
              <Button onClick={confirmRemove}>Remove</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SprintProgresses;
