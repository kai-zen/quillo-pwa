import { Button, cn } from "@/components/common";
import {
  formatStoryPoints,
  STORY_POINTS_BADGE_CLASS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
} from "@/components/tasks/helpers";
import { Task } from "@/shared/types";
import { FC } from "react";

interface RemainingTaskRowProps {
  task: Task;
  pending: boolean;
  scheduleLabel: string;
  onSchedule: () => void;
  onEdit: () => void;
}

const RemainingTaskRow: FC<RemainingTaskRowProps> = ({
  task,
  pending,
  scheduleLabel,
  onSchedule,
  onEdit,
}) => {
  const storyPointsLabel = formatStoryPoints(task.story_points);

  return (
  <li className="flex items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
    <span className="font-mono text-[11px] font-semibold tabular-nums text-muted">
      #{task.task_number}
    </span>
    <button
      type="button"
      className="min-w-0 flex-1 cursor-pointer truncate text-left text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
      onClick={onEdit}
      aria-label={`Edit task ${task.task_number}: ${task.title}`}
    >
      {task.title}
    </button>
    <span
      className={cn(
        "hidden items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold sm:inline-flex",
        STATUS_BADGE_CLASS[task.status],
      )}
    >
      <span
        className={cn("h-1 w-1 rounded-full", STATUS_DOT_CLASS[task.status])}
        aria-hidden
      />
      {STATUS_LABELS[task.status]}
    </span>
    {storyPointsLabel ? (
      <span
        className={cn(
          "hidden shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums sm:inline-flex",
          STORY_POINTS_BADGE_CLASS,
        )}
        title="Story points"
      >
        {storyPointsLabel} SP
      </span>
    ) : null}
    <Button
      variant="secondary"
      size="sm"
      className="h-7 shrink-0 px-2 text-xs"
      disabled={pending}
      onClick={onSchedule}
    >
      {pending ? "Saving…" : scheduleLabel}
    </Button>
  </li>
  );
};

export default RemainingTaskRow;
