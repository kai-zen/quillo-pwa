"use client";

import { Plus, TrendingUp } from "lucide-react";
import { FC } from "react";
import {
  Button,
  Modal,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common";
import type { Progress } from "@/shared/types";
import ProgressForm, { progressFormTitle } from "./form/ProgressForm";
import { formatProgressDetails, PROGRESS_INPUT_TYPE_LABELS } from "./helpers";
import type { ProgressesListViewModel } from "./hooks/useProgressesListView";

interface Props {
  view: ProgressesListViewModel;
}

const ProgressesList: FC<Props> = ({ view }) => {
  const {
    page,
    setPage,
    progressFormMode,
    progresses,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateProgress,
    openEditProgress,
    closeProgressForm,
    onProgressSaved,
  } = view;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title="Progress"
        description="Define trackers you can fill in day by day."
        icon={TrendingUp}
        actions={
          <Button onClick={openCreateProgress} size="sm">
            <Plus className="h-4 w-4" aria-hidden />
            New progress
          </Button>
        }
      />

      <Modal
        open={!!progressFormMode}
        onClose={closeProgressForm}
        title={progressFormMode ? progressFormTitle(progressFormMode) : ""}
        className="max-w-lg"
      >
        {progressFormMode && (
          <ProgressForm
            key={
              progressFormMode.type === "edit"
                ? progressFormMode.progress._id
                : "create"
            }
            mode={progressFormMode}
            onClose={closeProgressForm}
            onSaved={onProgressSaved}
          />
        )}
      </Modal>

      {isLoading && <p className="text-sm text-muted">Loading progress…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load progress. Try refreshing the page.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">No progress trackers yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a tracker like pages read, a workout, or a daily habit.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={openCreateProgress}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New progress
          </Button>
        </div>
      )}

      {!isLoading && !isError && progresses.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-32">Type</TableHead>
              <TableHead className="w-64">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {progresses.map((progress: Progress) => (
              <TableRow
                key={progress._id}
                onClick={() => openEditProgress(progress)}
                aria-label={`Edit progress ${progress.title}`}
              >
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
                  <span className="text-sm text-muted">
                    {PROGRESS_INPUT_TYPE_LABELS[progress.input_type]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="block truncate text-sm text-muted">
                    {formatProgressDetails(progress)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isFetching}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page >= totalPages || isFetching}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProgressesList;
