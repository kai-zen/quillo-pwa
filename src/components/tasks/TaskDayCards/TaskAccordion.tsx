"use client";

import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { FC } from "react";
import { Button, Markdown, cn } from "@/components/common";
import type { Label, RecordId, Task } from "@/shared/types";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
} from "../helpers";
import DoneCheckbox from "./DoneCheckbox";
import SubtaskRow from "./SubtaskRow";

interface Props {
  task: Task;
  childrenTasks: Task[];
  labels: Label[];
  pendingId: RecordId | null;
  onEdit: (task: Task) => void;
  onCreateSubtask: (parent: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskAccordion: FC<Props> = ({
  task,
  childrenTasks,
  labels,
  pendingId,
  onEdit,
  onCreateSubtask,
  onToggleDone,
  onDelete,
}) => {
  const done = task.status === "done";
  const pending = pendingId === task._id;
  const description = task.description.trim();
  const hasSubtasks = childrenTasks.length > 0;
  const subtasksDone = childrenTasks.filter(
    (child) => child.status === "done",
  ).length;

  return (
    <details className="group/card rounded-xl border border-border bg-surface shadow-sm shadow-black/2">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-start gap-2.5 px-3 py-2.5",
          "[&::-webkit-details-marker]:hidden",
          "hover:bg-foreground/3",
        )}
      >
        <DoneCheckbox
          task={task}
          pending={pending}
          onToggleDone={onToggleDone}
        />

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium leading-snug text-foreground",
              done && "text-muted line-through",
            )}
          >
            {task.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-[11px] font-semibold tabular-nums text-muted">
              #{task.task_number}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                STATUS_BADGE_CLASS[task.status],
              )}
            >
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  STATUS_DOT_CLASS[task.status],
                )}
                aria-hidden
              />
              {STATUS_LABELS[task.status]}
            </span>
            {task.priority !== "unset" && (
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                  PRIORITY_BADGE_CLASS[task.priority],
                )}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
            )}
            {hasSubtasks && (
              <span className="text-[11px] tabular-nums text-muted">
                {subtasksDone}/{childrenTasks.length} sub
              </span>
            )}
            {labels.map((label) => (
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
          </div>
        </div>

        <ChevronDown
          className="mt-0.5 h-4 w-4 shrink-0 text-muted transition-transform group-open/card:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="space-y-3 border-t border-border px-3 py-3">
        {description ? (
          <Markdown className="text-muted">{description}</Markdown>
        ) : null}

        <section className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              {hasSubtasks
                ? `Subtasks · ${subtasksDone}/${childrenTasks.length}`
                : "Subtasks"}
            </h3>
            <Button
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => onCreateSubtask(task)}
              startIcon={<Plus className="h-3.5 w-3.5" aria-hidden />}
              className="h-7 px-2 text-xs"
            >
              Add subtask
            </Button>
          </div>

          {hasSubtasks ? (
            <ul className="rounded-lg border border-border bg-accent-soft/35">
              {childrenTasks.map((child, index) => (
                <li
                  key={child._id}
                  className={cn(index > 0 && "border-t border-border/80")}
                >
                  <SubtaskRow
                    task={child}
                    pending={pendingId === child._id}
                    onEdit={onEdit}
                    onToggleDone={onToggleDone}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted">No subtasks yet.</p>
          )}
        </section>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onEdit(task)}
            startIcon={<Pencil className="h-3.5 w-3.5" aria-hidden />}
            className="text-amber-700 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onDelete(task)}
            startIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
            className="text-rose-700 hover:bg-rose-500/10 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300"
          >
            Delete
          </Button>
        </div>
      </div>
    </details>
  );
};

export default TaskAccordion;
