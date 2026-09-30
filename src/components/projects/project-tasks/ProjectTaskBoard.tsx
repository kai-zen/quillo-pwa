"use client";

import { DragEvent, useMemo, useState } from "react";
import { Button, cn } from "@/components/common";
import {
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
  STORY_POINTS_BADGE_CLASS,
  formatStoryPoints,
  labelsById,
} from "@/components/tasks/helpers";
import type { Label, RecordId, Sprint, Task, TaskStatus } from "@/shared/types";
import { PROJECT_TASK_PAGE_LIMIT, formatTaskCount, pageRange } from "./helpers";
import type { ProjectStatusSlice } from "./useProjectTaskBrowser";

const TASK_DRAG_TYPE = "application/x-quillo-task-id";

export default function ProjectTaskBoard({
  slices,
  labels,
  sprints,
  pendingId,
  onEdit,
  onStatusChange,
  onPage,
}: {
  slices: ProjectStatusSlice[];
  labels: Label[];
  sprints: Sprint[];
  pendingId: RecordId | null;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onPage: (status: TaskStatus, page: number) => void;
}) {
  const [draggingId, setDraggingId] = useState<RecordId | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  const labelMap = labelsById(labels);
  const sprintNames = new Map(sprints.map((sprint) => [sprint._id, sprint.name]));
  const canDrag = slices.length > 1;

  const byId = useMemo(() => {
    const map = new Map<RecordId, Task>();
    for (const slice of slices) {
      for (const task of slice.tasks) map.set(task._id, task);
    }
    return map;
  }, [slices]);

  const handleDragStart = (task: Task) => (event: DragEvent) => {
    if (!canDrag) return;
    event.dataTransfer.setData(TASK_DRAG_TYPE, task._id);
    event.dataTransfer.setData("text/plain", task._id);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(task._id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setOverStatus(null);
  };

  const handleDragOver = (status: TaskStatus) => (event: DragEvent) => {
    if (!canDrag) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overStatus !== status) setOverStatus(status);
  };

  const handleDrop = (status: TaskStatus) => (event: DragEvent) => {
    if (!canDrag) return;
    event.preventDefault();
    setOverStatus(null);
    setDraggingId(null);
    const id =
      event.dataTransfer.getData(TASK_DRAG_TYPE) ||
      event.dataTransfer.getData("text/plain");
    const task = byId.get(id);
    if (!task || task.status === status) return;
    onStatusChange(task, status);
  };

  return (
    <div className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-full gap-3">
        {slices.map((slice) => {
          const isOver = overStatus === slice.status;

          return (
            <section
              key={slice.status}
              aria-label={STATUS_LABELS[slice.status]}
              className={cn(
                "flex max-h-[32rem] min-w-60 flex-1 flex-col rounded-xl border bg-accent-soft/40",
                isOver ? "border-foreground/25 bg-accent-soft" : "border-border",
              )}
              onDragOver={handleDragOver(slice.status)}
              onDragLeave={(event) => {
                const next = event.relatedTarget as Node | null;
                if (next && event.currentTarget.contains(next)) return;
                setOverStatus((current) =>
                  current === slice.status ? null : current,
                );
              }}
              onDrop={handleDrop(slice.status)}
            >
              <header className="flex items-center justify-between gap-2 px-2.5 py-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                    STATUS_BADGE_CLASS[slice.status],
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      STATUS_DOT_CLASS[slice.status],
                    )}
                    aria-hidden
                  />
                  {STATUS_LABELS[slice.status]}
                </span>
                <span className="text-[11px] font-medium tabular-nums text-muted">
                  {formatTaskCount(slice.total)}
                </span>
              </header>

              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {slice.isLoading ? (
                  <p className="px-2 py-6 text-center text-xs text-muted">
                    Loading…
                  </p>
                ) : null}
                {slice.isError ? (
                  <p className="px-2 py-6 text-center text-xs">
                    Could not load this column.
                  </p>
                ) : null}
                {!slice.isLoading && !slice.isError && slice.tasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-2 py-6 text-center text-xs text-muted">
                    {draggingId ? "Drop here" : "No tasks"}
                  </p>
                ) : null}
                {slice.tasks.map((task) => {
                  const taskLabels = task.label_ids
                    .map((id) => labelMap.get(id))
                    .filter((label): label is Label => !!label)
                    .slice(0, 3);
                  const pending = pendingId === task._id;
                  const dragging = draggingId === task._id;
                  const storyPoints = formatStoryPoints(task.story_points);
                  const childCount = task.children?.length ?? 0;
                  const sprintName = task.sprint_id
                    ? sprintNames.get(task.sprint_id)
                    : null;

                  return (
                    <div
                      key={task._id}
                      role="button"
                      tabIndex={pending ? -1 : 0}
                      draggable={canDrag && !pending}
                      onDragStart={handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (!pending) onEdit(task);
                      }}
                      onKeyDown={(event) => {
                        if (pending) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onEdit(task);
                        }
                      }}
                      aria-label={`Edit task ${task.task_number}: ${task.title}`}
                      className={cn(
                        "cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-2 text-left shadow-sm shadow-black/2",
                        "transition-colors hover:border-foreground/20 hover:bg-foreground/3",
                        "focus-visible:bg-foreground/4 focus-visible:outline-none",
                        pending && "cursor-wait opacity-60",
                        dragging && "opacity-50",
                      )}
                    >
                      <span className="font-mono text-[11px] font-semibold tabular-nums text-muted">
                        #{task.task_number}
                      </span>
                      <span className="mt-0.5 flex items-start gap-1.5">
                        <span className="block flex-1 text-sm leading-snug font-medium text-foreground">
                          {task.title}
                        </span>
                        {storyPoints ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                              STORY_POINTS_BADGE_CLASS,
                            )}
                          >
                            {storyPoints}
                          </span>
                        ) : null}
                      </span>
                      {sprintName ? (
                        <span className="mt-1 block truncate text-[11px] text-muted">
                          {sprintName}
                        </span>
                      ) : null}
                      {childCount > 0 ? (
                        <span className="mt-1 block text-[11px] text-muted">
                          {childCount} subtask{childCount === 1 ? "" : "s"}
                        </span>
                      ) : null}
                      {taskLabels.length > 0 ? (
                        <span className="mt-1.5 flex flex-wrap gap-1">
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
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {slice.totalPages > 1 ? (
                <footer className="flex items-center justify-between gap-2 border-t border-border px-2 py-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      onPage(slice.status, Math.max(1, slice.page - 1))
                    }
                    disabled={slice.page <= 1 || slice.isFetching}
                  >
                    Prev
                  </Button>
                  <span className="text-[11px] tabular-nums text-muted">
                    {pageRange(slice.page, PROJECT_TASK_PAGE_LIMIT, slice.total)}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      onPage(
                        slice.status,
                        Math.min(slice.totalPages, slice.page + 1),
                      )
                    }
                    disabled={slice.page >= slice.totalPages || slice.isFetching}
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
