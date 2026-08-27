"use client";

import { ArrowRight, ChevronDown, Flag, ListPlus, Plus } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { Button, cn } from "@/components/common";
import { todayIso } from "@/components/tasks/helpers";
import type { RecordId, Sprint, Task } from "@/shared/types";
import AddTasksToSprintModal from "../AddTasksToSprintModal";
import {
  formatSprintCountdown,
  formatSprintRange,
  sprintHref,
  SPRINT_STATUS_BADGE_CLASS,
  SPRINT_STATUS_DOT_CLASS,
  SPRINT_STATUS_LABELS,
} from "../helpers";
import { useActiveSprint } from "../hooks/useActiveSprint";
import RemainingTaskRow from "./RemainingTaskRow";

interface Props {
  sprints: Sprint[];
  selectedDate: string;
  onCreateTask: (sprintId: RecordId) => void;
  onEditTask: (task: Task) => void;
}

const ActiveSprintCard: FC<Props> = ({
  sprints,
  selectedDate,
  onCreateTask,
  onEditTask,
}) => {
  const {
    sprint,
    progress,
    remaining,
    isLoading,
    isError,
    addTasksOpen,
    pendingId,
    actionError,
    openAddTasks,
    closeAddTasks,
    scheduleForDay,
  } = useActiveSprint(sprints, selectedDate);

  if (!sprint) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Flag className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
          <div>
            <p className="font-medium text-foreground">No active sprint</p>
            <p className="mt-0.5 text-sm text-muted">
              Start a sprint to keep this week’s work in one place.
            </p>
          </div>
        </div>
        <Link href="/sprints">
          <Button variant="secondary" size="sm">
            View sprints
          </Button>
        </Link>
      </div>
    );
  }

  const scheduleLabel = selectedDate === todayIso() ? "Today" : "This day";
  const progressLabel = isLoading
    ? "Loading…"
    : isError
      ? "Could not load tasks"
      : progress.total === 0
        ? "No tasks yet"
        : `${progress.done}/${progress.total} done`;

  return (
    <>
      <details className="group/sprint rounded-xl border border-border bg-surface shadow-sm shadow-black/2">
        <summary
          className={cn(
            "flex cursor-pointer list-none items-start gap-2.5 px-3 py-2.5",
            "[&::-webkit-details-marker]:hidden",
            "hover:bg-foreground/3",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold tabular-nums text-muted">
                #{sprint.sprint_number}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold",
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
              <h2
                id="active-sprint-heading"
                className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground"
              >
                {sprint.name}
              </h2>
            </div>
            <p className="mt-1 text-xs tabular-nums text-muted">
              {formatSprintCountdown(sprint.end_date)}
              <span aria-hidden> · </span>
              {progressLabel}
            </p>
            {!isLoading && !isError && progress.total > 0 && (
              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-accent-soft"
                role="status"
                aria-label={`${progress.done} of ${progress.total} sprint tasks done, ${progress.percent} percent`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width,background-color] duration-500 ease-out",
                    progress.complete
                      ? "bg-emerald-500"
                      : progress.percent === 0
                        ? "bg-transparent"
                        : "bg-foreground",
                  )}
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            )}
          </div>
          <ChevronDown
            className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-open/sprint:rotate-180"
            aria-hidden
          />
        </summary>

        <div className="space-y-3 border-t border-border px-3 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {formatSprintRange(sprint.start_date, sprint.end_date)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={openAddTasks}>
                <ListPlus className="h-4 w-4" aria-hidden />
                Add tasks
              </Button>
              <Button size="sm" onClick={() => onCreateTask(sprint._id)}>
                <Plus className="h-4 w-4" aria-hidden />
                New task
              </Button>
              <Link
                href={sprintHref(sprint)}
                className="inline-flex items-center gap-1 px-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Open
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          {isLoading && (
            <p className="text-sm text-muted">Loading sprint tasks…</p>
          )}

          {isError && (
            <p className="text-sm text-foreground">
              Could not load sprint tasks.
            </p>
          )}

          {!isLoading && !isError && progress.total === 0 && (
            <p className="text-sm text-muted">
              No tasks in this sprint yet. Add some to start the week.
            </p>
          )}

          {remaining.items.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Not on this day
              </p>
              <ul className="overflow-hidden rounded-lg border border-border">
                {remaining.items.map((task) => (
                  <RemainingTaskRow
                    key={task._id}
                    task={task}
                    pending={pendingId === task._id}
                    scheduleLabel={scheduleLabel}
                    onSchedule={() => scheduleForDay(task)}
                    onEdit={() => onEditTask(task)}
                  />
                ))}
              </ul>
              {remaining.extra > 0 && (
                <Link
                  href={sprintHref(sprint)}
                  className="mt-2 inline-block text-xs font-medium text-muted transition-colors hover:text-foreground"
                >
                  +{remaining.extra} more in this sprint
                </Link>
              )}
            </div>
          )}

          {actionError && (
            <p className="text-sm text-rose-500">{actionError}</p>
          )}
        </div>
      </details>

      <AddTasksToSprintModal
        open={addTasksOpen}
        sprintId={sprint._id}
        sprints={sprints}
        onClose={closeAddTasks}
      />
    </>
  );
};

export default ActiveSprintCard;
