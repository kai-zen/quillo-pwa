"use client";

import { ChevronDown, ListPlus, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { Button, cn } from "@/components/common";
import type { RecordId, Sprint, Task } from "@/shared/types";
import AddTasksToSprintModal from "../AddTasksToSprintModal";
import {
  formatSprintCountdown,
  formatSprintRange,
  sprintHref,
} from "../helpers";
import { useActiveSprint } from "../hooks/useActiveSprint";
import RemainingTaskRow from "./RemainingTaskRow";
import SprintProgressRing from "./SprintProgressRing";

interface Props {
  sprints: Sprint[];
  onCreateTask: (sprintId: RecordId) => void;
  onEditTask: (task: Task) => void;
}

const ActiveSprintCard: FC<Props> = ({ sprints, onCreateTask, onEditTask }) => {
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
  } = useActiveSprint(sprints);

  if (!sprint) return null;
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
            "flex cursor-pointer list-none items-center gap-2.5 px-3 py-2.5",
            "[&::-webkit-details-marker]:hidden",
            "hover:bg-foreground/3",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <SprintProgressRing
                percent={isLoading || isError ? 0 : progress.percent}
                complete={!isLoading && !isError && progress.complete}
                label={
                  isLoading
                    ? "Loading sprint progress"
                    : isError
                      ? "Could not load sprint progress"
                      : `${progress.done} of ${progress.total} sprint tasks done, ${progress.percent} percent`
                }
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    id="active-sprint-heading"
                    className="min-w-0 truncate font-semibold tracking-tight text-foreground"
                  >
                    {sprint.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="mt-1 text-xs tabular-nums text-muted">
                    {formatSprintCountdown(sprint.end_date)}
                  </p>
                  <div className="mt-1 h-0.5 w-0.5 rounded-full bg-black/60" />
                  <p className="mt-1 text-xs tabular-nums text-muted">
                    {progressLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-muted transition-transform group-open/sprint:rotate-180"
            aria-hidden
          />
        </summary>

        <div className="space-y-3 border-t border-border px-3 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {formatSprintRange(sprint.start_date, sprint.end_date)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={openAddTasks}>
                <ListPlus className="h-4 w-4" aria-hidden />
                Add tasks
              </Button>
              <Link
                href={sprintHref(sprint)}
                aria-label="Open sprint"
                title="Open sprint"
                className="inline-flex cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden />
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
                Not on today
              </p>
              <ul className="overflow-hidden rounded-lg border border-border">
                {remaining.items.map((task) => (
                  <RemainingTaskRow
                    key={task._id}
                    task={task}
                    pending={pendingId === task._id}
                    scheduleLabel="Today"
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
        onCreateTask={() => {
          closeAddTasks();
          onCreateTask(sprint._id);
        }}
      />
    </>
  );
};

export default ActiveSprintCard;
