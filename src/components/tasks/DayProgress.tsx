"use client";

import { FC } from "react";
import { cn } from "@/components/common";
import type { Task } from "@/shared/types";
import { groupTasks } from "./helpers";

interface Props {
  tasks: Task[];
}

function dayProgressStats(tasks: Task[]) {
  const seen = new Set<string>();
  const actionable: Task[] = [];

  const consider = (task: Task) => {
    if (seen.has(task._id) || task.status === "cancelled") return;
    seen.add(task._id);
    actionable.push(task);
  };

  for (const { task, children } of groupTasks(tasks)) {
    consider(task);
    for (const child of children) consider(child);
  }

  const done = actionable.filter((task) => task.status === "done").length;
  const total = actionable.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { done, total, percent, complete: total > 0 && done === total };
}

const DayProgress: FC<Props> = ({ tasks }) => {
  const { done, total, percent, complete } = dayProgressStats(tasks);

  if (total === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${done} of ${total} tasks done, ${percent} percent`}
    >
      <div className="h-2 overflow-hidden rounded-full bg-accent-soft">
        <div
          className={cn(
            "h-full rounded-full transition-[width,background-color] duration-500 ease-out",
            complete
              ? "bg-emerald-500"
              : percent === 0
                ? "bg-transparent"
                : "bg-foreground",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default DayProgress;
