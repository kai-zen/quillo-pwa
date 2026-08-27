"use client";

import { ListFilter, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";
import {
  Button,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@/components/common";
import type { Sprint, SprintStatus } from "@/shared/types";
import { SPRINT_STATUSES } from "@/shared/types";
import SprintForm, { sprintFormTitle } from "./form/SprintForm";
import {
  formatSprintRange,
  sprintHref,
  SPRINT_STATUS_BADGE_CLASS,
  SPRINT_STATUS_DOT_CLASS,
  SPRINT_STATUS_LABELS,
} from "./helpers";
import type { SprintsListViewModel } from "./hooks/useSprintsListView";

interface Props {
  view: SprintsListViewModel;
}

const SprintsList: FC<Props> = ({ view }) => {
  const router = useRouter();
  const {
    statusFilter,
    setStatusFilterAndResetPage,
    page,
    setPage,
    sprintFormMode,
    sprints,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateSprint,
    closeSprintForm,
    onSprintSaved,
  } = view;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
            Sprints
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Group work into timed buckets and focus on one at a time.
          </p>
        </div>
        <Button onClick={openCreateSprint} className="shadow-sm">
          <Plus className="h-4 w-4" aria-hidden />
          New sprint
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
        <span className="inline-flex items-center gap-2 pl-1 text-sm font-medium text-foreground">
          <ListFilter className="h-4 w-4 text-muted" aria-hidden />
          Filter
        </span>
        <span className="h-5 w-px bg-border" aria-hidden />
        <label className="sr-only" htmlFor="sprints-status-filter">
          Filter by status
        </label>
        <Select
          id="sprints-status-filter"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilterAndResetPage(
              event.target.value as SprintStatus | "",
            );
          }}
          sizeVariant="sm"
          className="w-36"
        >
          <option value="">All statuses</option>
          {SPRINT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {SPRINT_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
          {total} sprint{total === 1 ? "" : "s"}
        </span>
      </div>

      <Modal
        open={!!sprintFormMode}
        onClose={closeSprintForm}
        title={sprintFormMode ? sprintFormTitle(sprintFormMode) : ""}
        className="max-w-3xl"
      >
        {sprintFormMode && (
          <SprintForm
            key={
              sprintFormMode.type === "edit"
                ? sprintFormMode.sprint._id
                : "create"
            }
            mode={sprintFormMode}
            onClose={closeSprintForm}
            onSaved={onSprintSaved}
          />
        )}
      </Modal>

      {isLoading && <p className="text-sm text-muted">Loading sprints…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load sprints. Try refreshing the page.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">No sprints yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a sprint to plan a slice of work.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={openCreateSprint}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New sprint
          </Button>
        </div>
      )}

      {!isLoading && !isError && sprints.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-52">Dates</TableHead>
              <TableHead className="w-32">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sprints.map((sprint: Sprint) => (
              <TableRow
                key={sprint._id}
                onClick={() => router.push(sprintHref(sprint))}
                aria-label={`Open sprint ${sprint.sprint_number}: ${sprint.name}`}
              >
                <TableCell>
                  <span className="font-mono text-xs font-semibold tabular-nums text-muted">
                    #{sprint.sprint_number}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="block truncate font-medium text-foreground">
                    {sprint.name}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted">
                    {formatSprintRange(sprint.start_date, sprint.end_date)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                      SPRINT_STATUS_BADGE_CLASS[sprint.status],
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        SPRINT_STATUS_DOT_CLASS[sprint.status],
                      )}
                      aria-hidden
                    />
                    {SPRINT_STATUS_LABELS[sprint.status]}
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

export default SprintsList;
