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

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleDone(task);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={
        done
          ? `Mark task ${task.task_number} as not done`
          : `Mark task ${task.task_number} as done`
      }
      disabled={pending}
      onClick={handleClick}
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        done
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-surface text-transparent hover:border-foreground/40",
      )}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
    </button>
  );
};

export default DoneCheckbox;
