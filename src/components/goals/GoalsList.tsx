"use client";

import { ListFilter, Plus, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC } from "react";
import {
  Button,
  Modal,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@/components/common";
import type { Goal, GoalStatus } from "@/shared/types";
import { GOAL_STATUSES } from "@/shared/types";
import GoalForm, { goalFormTitle } from "./form/GoalForm";
import {
  formatGoalRange,
  goalHref,
  GOAL_STATUS_BADGE_CLASS,
  GOAL_STATUS_DOT_CLASS,
  GOAL_STATUS_LABELS,
  objectiveProgress,
} from "./helpers";
import type { GoalsListViewModel } from "./hooks/useGoalsListView";

interface Props {
  view: GoalsListViewModel;
}

const GoalsList: FC<Props> = ({ view }) => {
  const router = useRouter();
  const {
    statusFilter,
    setStatusFilterAndResetPage,
    page,
    setPage,
    goalFormMode,
    goals,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateGoal,
    closeGoalForm,
    onGoalSaved,
  } = view;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title="Goals"
        description="Track longer-term outcomes and the steps that get you there."
        icon={Target}
        actions={
          <Button onClick={openCreateGoal} size="sm">
            <Plus className="h-4 w-4" aria-hidden />
            New goal
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
        <span className="inline-flex items-center gap-2 pl-1 text-sm font-medium text-foreground">
          <ListFilter className="h-4 w-4 text-muted" aria-hidden />
          Filter
        </span>
        <span className="h-5 w-px bg-border" aria-hidden />
        <label className="sr-only" htmlFor="goals-status-filter">
          Filter by status
        </label>
        <Select
          id="goals-status-filter"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilterAndResetPage(event.target.value as GoalStatus | "");
          }}
          sizeVariant="sm"
        >
          <option value="">All statuses</option>
          {GOAL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {GOAL_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
          {total} goal{total === 1 ? "" : "s"}
        </span>
      </div>

      <Modal
        open={!!goalFormMode}
        onClose={closeGoalForm}
        title={goalFormMode ? goalFormTitle(goalFormMode) : ""}
        className="max-w-3xl"
      >
        {goalFormMode && (
          <GoalForm
            key={
              goalFormMode.type === "edit" ? goalFormMode.goal._id : "create"
            }
            mode={goalFormMode}
            onClose={closeGoalForm}
            onSaved={onGoalSaved}
          />
        )}
      </Modal>

      {isLoading && <p className="text-sm text-muted">Loading goals…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load goals. Try refreshing the page.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">No goals yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a goal to plan outcomes beyond a single sprint.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={openCreateGoal}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New goal
          </Button>
        </div>
      )}

      {!isLoading && !isError && goals.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="w-52">Dates</TableHead>
              <TableHead className="w-36">Progress</TableHead>
              <TableHead className="w-32">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {goals.map((goal: Goal) => (
              <TableRow
                key={goal._id}
                onClick={() => router.push(goalHref(goal))}
                aria-label={`Open goal ${goal.title}`}
              >
                <TableCell>
                  <span className="block truncate font-medium text-foreground">
                    {goal.title}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted">
                    {formatGoalRange(goal.start_date, goal.target_date)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm tabular-nums text-muted">
                    {objectiveProgress(goal)}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                      GOAL_STATUS_BADGE_CLASS[goal.status],
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        GOAL_STATUS_DOT_CLASS[goal.status],
                      )}
                      aria-hidden
                    />
                    {GOAL_STATUS_LABELS[goal.status]}
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

export default GoalsList;
