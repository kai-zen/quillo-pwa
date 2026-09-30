"use client";

import { FC, DragEvent, useMemo, useState } from "react";
import { cn } from "@/components/common";
import type { Label, RecordId, Task, TaskStatus } from "@/shared/types";
import { TASK_STATUSES } from "@/shared/types";
import {
  formatStoryPoints,
  groupTasks,
  labelsById,
  STORY_POINTS_BADGE_CLASS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
} from "./helpers";

const TASK_DRAG_TYPE = "application/x-quillo-task-id";

interface Props {
  tasks: Task[];
  labels: Label[];
  pendingId: RecordId | null;
  onEdit: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const TaskKanbanBoard: FC<Props> = ({
  tasks,
  labels,
  pendingId,
  onEdit,
  onStatusChange,
}) => {
  const [draggingId, setDraggingId] = useState<RecordId | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  const labelMap = labelsById(labels);
  const items = useMemo(
    () =>
      groupTasks(tasks).flatMap(({ task, children }) => [task, ...children]),
    [tasks],
  );
  const byId = useMemo(
    () => new Map(items.map((task) => [task._id, task])),
    [items],
  );

  const columns = TASK_STATUSES.map((status) => ({
    status,
    tasks: items.filter((task) => task.status === status),
  }));

  const handleDragStart = (task: Task) => (event: DragEvent) => {
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
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (overStatus !== status) setOverStatus(status);
  };

  const handleDragLeave = (status: TaskStatus) => (event: DragEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) return;
    setOverStatus((current) => (current === status ? null : current));
  };

  const handleDrop = (status: TaskStatus) => (event: DragEvent) => {
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
    <div className="min-w-0 -mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-full gap-3">
        {columns.map(({ status, tasks: columnTasks }) => {
          const isOver = overStatus === status;

          return (
            <section
              key={status}
              className={cn(
                "flex min-h-72 min-w-56 flex-1 flex-col rounded-xl border bg-accent-soft/40",
                isOver ? "border-foreground/25 bg-accent-soft" : "border-border",
              )}
              onDragOver={handleDragOver(status)}
              onDragLeave={handleDragLeave(status)}
              onDrop={handleDrop(status)}
            >
              <header className="flex items-center justify-between gap-2 px-2.5 py-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                    STATUS_BADGE_CLASS[status],
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      STATUS_DOT_CLASS[status],
                    )}
                    aria-hidden
                  />
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-[11px] font-medium tabular-nums text-muted">
                  {columnTasks.length}
                </span>
              </header>

              <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                {columnTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-2 py-6 text-center text-xs text-muted">
                    {draggingId ? "Drop here" : "No tasks"}
                  </p>
                ) : (
                  columnTasks.map((task) => {
                    const taskLabels = task.label_ids
                      .map((id) => labelMap.get(id))
                      .filter((label): label is Label => !!label);
                    const pending = pendingId === task._id;
                    const dragging = draggingId === task._id;
                    const storyPointsLabel = formatStoryPoints(
                      task.story_points,
                    );

                    return (
                      <div
                        key={task._id}
                        role="button"
                        tabIndex={pending ? -1 : 0}
                        draggable={!pending}
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
                        aria-disabled={pending}
                        className={cn(
                          "cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-2 text-left shadow-sm shadow-black/2",
                          "transition-colors hover:border-foreground/20 hover:bg-foreground/3",
                          "focus-visible:bg-foreground/4 focus-visible:outline-none",
                          pending && "cursor-wait opacity-60",
                          dragging && "opacity-50",
                          draggingId && !dragging && "pointer-events-none",
                        )}
                      >
                        <span className="font-mono text-[11px] font-semibold tabular-nums text-muted">
                          #{task.task_number}
                        </span>
                        <div className="mt-0.5 flex items-start gap-1.5">
                          <span className="block flex-1 text-sm font-medium leading-snug text-foreground">
                            {task.title}
                          </span>
                          {storyPointsLabel ? (
                            <span
                              className={cn(
                                "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                                STORY_POINTS_BADGE_CLASS,
                              )}
                              title="Story points"
                            >
                              {storyPointsLabel}
                            </span>
                          ) : null}
                        </div>
                        {task.parent_id ? (
                          <span className="mt-1 block text-[11px] text-muted">
                            Subtask
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
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default TaskKanbanBoard;
