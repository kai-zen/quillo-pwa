"use client";

import { Trash2 } from "lucide-react";
import { FC } from "react";
import { IconButton, cn } from "@/components/common";
import type { Task } from "@/shared/types";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_LABELS,
  STORY_POINTS_BADGE_CLASS,
  formatStoryPoints,
  isTaskSettled,
} from "../helpers";
import DoneCheckbox from "./DoneCheckbox";

interface Props {
  task: Task;
  pending: boolean;
  onEdit: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const SubtaskRow: FC<Props> = ({
  task,
  pending,
  onEdit,
  onToggleDone,
  onDelete,
}) => {
  const settled = isTaskSettled(task);
  const storyPointsLabel = formatStoryPoints(task.story_points);

  return (
    <div className="flex items-center gap-2 px-2.5 py-2">
      <DoneCheckbox task={task} pending={pending} onToggleDone={onToggleDone} />

      <button
        type="button"
        onClick={() => onEdit(task)}
        disabled={pending}
        className={cn(
          "min-w-0 flex-1 cursor-pointer truncate text-left text-sm leading-snug",
          "hover:underline focus-visible:underline focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          settled ? "text-muted line-through" : "text-foreground",
        )}
      >
        {task.title}
      </button>

      {task.priority !== "unset" && (
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
            PRIORITY_BADGE_CLASS[task.priority],
          )}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      )}

      {storyPointsLabel && (
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            STORY_POINTS_BADGE_CLASS,
          )}
          title="Story points"
        >
          {storyPointsLabel} SP
        </span>
      )}

      <IconButton
        label={`Delete subtask ${task.task_number}`}
        size="sm"
        disabled={pending}
        onClick={() => onDelete(task)}
        className={cn(
          "shrink-0 text-muted transition-colors",
          "hover:bg-rose-500/10 hover:text-rose-700",
          "dark:hover:bg-rose-400/10 dark:hover:text-rose-300",
        )}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </IconButton>
    </div>
  );
};

export default SubtaskRow;
