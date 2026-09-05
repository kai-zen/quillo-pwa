"use client";

import { Check } from "lucide-react";
import { FC, MouseEvent } from "react";
import { cn } from "@/components/common";
import type { Task } from "@/shared/types";

interface Props {
  task: Task;
  pending: boolean;
  onToggleDone: (task: Task) => void;
}

const DoneCheckbox: FC<Props> = ({ task, pending, onToggleDone }) => {
  const done = task.status === "done";
  const cancelled = task.status === "cancelled";

  if (cancelled) return null;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (cancelled) return;
    onToggleDone(task);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={
        cancelled
          ? `Task ${task.task_number} is cancelled`
          : done
            ? `Mark task ${task.task_number} as not done`
            : `Mark task ${task.task_number} as done`
      }
      disabled={pending || cancelled}
      onClick={handleClick}
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
        "disabled:cursor-not-allowed",
        cancelled
          ? "border-rose-300 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300"
          : done
            ? "cursor-pointer border-foreground bg-foreground text-background disabled:opacity-50"
            : "cursor-pointer border-border bg-surface text-transparent hover:border-foreground/40 disabled:opacity-50",
      )}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
    </button>
  );
};

export default DoneCheckbox;
