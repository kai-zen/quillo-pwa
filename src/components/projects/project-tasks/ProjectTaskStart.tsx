"use client";

import { useState } from "react";
import { Button, cn } from "@/components/common";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_LABELS,
  STORY_POINTS_BADGE_CLASS,
  formatStoryPoints,
  labelsById,
} from "@/components/tasks/helpers";
import type { Label, RecordId, Sprint, Task } from "@/shared/types";
import { formatTaskCount, pageRange, type StartQuadrantId } from "./helpers";
import type { useProjectStartNext } from "./useProjectStartNext";

const PAGE_LIMIT = 8;

const QUADRANT_PAGE_DEFAULTS: Record<StartQuadrantId, number> = {
  now: 1,
  plan: 1,
  easy: 1,
  later: 1,
};

export default function ProjectTaskStart({
  startNext,
  labels,
  sprints,
  pendingId,
  hasFilters,
  onEdit,
  onStart,
}: {
  startNext: ReturnType<typeof useProjectStartNext>;
  labels: Label[];
  sprints: Sprint[];
  pendingId: RecordId | null;
  hasFilters: boolean;
  onEdit: (task: Task) => void;
  onStart: (task: Task) => void;
}) {
  const [pages, setPages] = useState(QUADRANT_PAGE_DEFAULTS);
  const labelMap = labelsById(labels);
  const sprintNames = new Map(sprints.map((sprint) => [sprint._id, sprint.name]));
  const { quadrants, isLoading, isError, isFetching, truncated } = startNext;
  const pageSignature = quadrants
    .map((quadrant) => quadrant.tasks.map((item) => item.task._id).join(","))
    .join("|");
  const [seenSignature, setSeenSignature] = useState(pageSignature);
  if (seenSignature !== pageSignature) {
    setSeenSignature(pageSignature);
    setPages(QUADRANT_PAGE_DEFAULTS);
  }
  const matchCount = quadrants.reduce((sum, quadrant) => sum + quadrant.tasks.length, 0);

  if (isLoading) {
    return <p className="text-sm text-muted">Sorting to-do tasks…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm">Could not load to-do tasks. Try refreshing the page.</p>
    );
  }

  if (matchCount === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
        <p className="font-medium">
          {hasFilters ? "No to-do tasks match" : "No to-do tasks"}
        </p>
        <p className="mt-1 text-sm text-muted">
          {hasFilters
            ? "Try another search, label, sprint, or priority."
            : "Tasks still to do will show here, smallest high-priority work first."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted">
        {isFetching ? "Updating · " : ""}
        {formatTaskCount(matchCount)} to-do task{matchCount === 1 ? "" : "s"}.
        Highest priority first, then fewer story points.
        {truncated
          ? " Showing the first 2,000 to-do tasks."
          : ""}
      </p>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {quadrants.map((quadrant) => {
          const totalPages = Math.max(
            1,
            Math.ceil(quadrant.tasks.length / PAGE_LIMIT),
          );
          const page = Math.min(pages[quadrant.id], totalPages);
          const visible = quadrant.tasks.slice(
            (page - 1) * PAGE_LIMIT,
            page * PAGE_LIMIT,
          );

          return (
            <section
              key={quadrant.id}
              aria-label={quadrant.title}
              className="flex min-h-48 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm shadow-black/2"
            >
              <header className="border-b border-border px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold">{quadrant.title}</h3>
                  <span className="text-xs font-medium tabular-nums text-muted">
                    {formatTaskCount(quadrant.tasks.length)}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted">{quadrant.description}</p>
              </header>
              {visible.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-muted">
                  Nothing in this group
                </p>
              ) : (
                <ul className="flex flex-1 flex-col">
                  {visible.map(({ task, rank }) => {
                    const pending = pendingId === task._id;
                    const storyPoints = formatStoryPoints(task.story_points);
                    const taskLabels = task.label_ids
                      .map((id) => labelMap.get(id))
                      .filter((label): label is Label => !!label)
                      .slice(0, 2);
                    const sprintName = task.sprint_id
                      ? sprintNames.get(task.sprint_id)
                      : null;

                    return (
                      <li
                        key={task._id}
                        className="flex items-start gap-2 border-b border-border px-3 py-2 last:border-b-0"
                      >
                        <span
                          className={cn(
                            "mt-0.5 w-6 shrink-0 text-xs font-semibold tabular-nums",
                            rank === 1 ? "text-foreground" : "text-muted",
                          )}
                        >
                          {rank}
                        </span>
                        <button
                          type="button"
                          onClick={() => onEdit(task)}
                          disabled={pending}
                          className="min-w-0 flex-1 cursor-pointer text-left disabled:cursor-wait disabled:opacity-60"
                        >
                          <span className="flex items-baseline gap-2">
                            <span className="shrink-0 font-mono text-[11px] text-muted">
                              #{task.task_number}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">
                              {task.title}
                            </span>
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-1.5">
                            {rank === 1 ? (
                              <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                                Next
                              </span>
                            ) : null}
                            {task.priority !== "unset" ? (
                              <span
                                className={cn(
                                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                                  PRIORITY_BADGE_CLASS[task.priority],
                                )}
                              >
                                {PRIORITY_LABELS[task.priority]}
                              </span>
                            ) : null}
                            {storyPoints ? (
                              <span
                                className={cn(
                                  "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                                  STORY_POINTS_BADGE_CLASS,
                                )}
                              >
                                {storyPoints} pt
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted">No estimate</span>
                            )}
                            {taskLabels.map((label) => (
                              <span
                                key={label._id}
                                className="inline-flex items-center gap-1 text-[11px] text-muted"
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: label.color }}
                                  aria-hidden
                                />
                                {label.name}
                              </span>
                            ))}
                            {sprintName ? (
                              <span className="max-w-32 truncate text-[11px] text-muted">
                                {sprintName}
                              </span>
                            ) : null}
                          </span>
                        </button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={pending}
                          onClick={() => onStart(task)}
                        >
                          Start
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {totalPages > 1 ? (
                <footer className="mt-auto flex items-center justify-between gap-2 border-t border-border px-3 py-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() =>
                      setPages((current) => ({
                        ...current,
                        [quadrant.id]: page - 1,
                      }))
                    }
                  >
                    Previous
                  </Button>
                  <span className="text-[11px] tabular-nums text-muted">
                    {pageRange(page, PAGE_LIMIT, quadrant.tasks.length)}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPages((current) => ({
                        ...current,
                        [quadrant.id]: page + 1,
                      }))
                    }
                  >
                    Next
                  </Button>
                </footer>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
