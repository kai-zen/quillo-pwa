"use client";

import {
  ChevronDown,
  FolderKanban,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";
import { Button, Markdown, cn } from "@/components/common";
import type { Label, Project, RecordId, Task } from "@/shared/types";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_LABELS,
  STORY_POINTS_BADGE_CLASS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
  formatStoryPoints,
  isTaskSettled,
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
  reorderHandle?:
    | (ButtonHTMLAttributes<HTMLButtonElement> & {
        dragging?: boolean;
      })
    | null;
}

const MetaSep: FC = () => (
  <span
    className="mx-1.5 h-2.5 w-px shrink-0 self-center bg-gray-300"
    aria-hidden
  />
);

const TaskAccordion: FC<Props> = ({
  task,
  childrenTasks,
  labels,
  pendingId,
  onEdit,
  onCreateSubtask,
  onToggleDone,
  onDelete,
  reorderHandle,
}) => {
  const settled = isTaskSettled(task);
  const cancelled = task.status === "cancelled";
  const pending = pendingId === task._id;
  const description = task.description.trim();
  const hasSubtasks = childrenTasks.length > 0;
  const subtasksDone = childrenTasks.filter(isTaskSettled).length;
  const project: Project | null =
    task.project_id && typeof task.project_id === "object"
      ? task.project_id
      : null;
  const storyPointsLabel = formatStoryPoints(task.story_points);
  const { dragging: reorderDragging, ...reorderHandleProps } =
    reorderHandle ?? {};

  return (
    <details
      className={cn(
        "group/card rounded-xl border border-border bg-surface shadow-sm shadow-black/2",
        cancelled && "opacity-70",
        reorderDragging && "opacity-40",
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-start gap-2.5 px-3 py-2.5",
          "[&::-webkit-details-marker]:hidden",
          "hover:bg-foreground/3",
        )}
      >
        {reorderHandle ? (
          <button
            {...reorderHandleProps}
            type="button"
            draggable={false}
            aria-label={`Reorder task ${task.task_number}`}
            aria-pressed={reorderDragging}
            title="Drag to reorder, or use arrow keys"
            className={cn(
              "-ml-1 mt-0 flex shrink-0 touch-none items-center justify-center rounded-md text-muted",
              "hover:bg-foreground/3 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
              "disabled:cursor-not-allowed disabled:opacity-40",
              reorderDragging ? "cursor-grabbing" : "cursor-grab",
            )}
          >
            <GripVertical className="h-4 w-4" aria-hidden />
          </button>
        ) : null}

        <DoneCheckbox
          task={task}
          pending={pending}
          onToggleDone={onToggleDone}
        />

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-medium text-sm md:text-base mb-1.5",
              settled && "text-muted line-through",
            )}
          >
            <span className="mr-1.5 font-mono text-xs tabular-nums mt-0.5">
              #{task.task_number}
            </span>
            {task.title}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-y-1">
            <span className="inline-flex items-center gap-1">
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
              {storyPointsLabel && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    STORY_POINTS_BADGE_CLASS,
                  )}
                  title="Story points"
                >
                  {storyPointsLabel} SP
                </span>
              )}
              {hasSubtasks && (
                <span className="pl-0.5 text-xs tabular-nums text-muted">
                  {subtasksDone}/{childrenTasks.length} sub
                </span>
              )}
            </span>

            {project ? (
              <>
                <MetaSep />
                <span
                  className="inline-flex max-w-44 items-center gap-1 text-xs font-medium text-foreground"
                  title={`Project: ${project.name}`}
                >
                  <FolderKanban
                    className="h-3 w-3 shrink-0"
                    style={{ color: project.color }}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span className="truncate">{project.name}</span>
                </span>
              </>
            ) : null}
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

        {labels.length > 0 ? (
          <>
            <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
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
            </span>
          </>
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
