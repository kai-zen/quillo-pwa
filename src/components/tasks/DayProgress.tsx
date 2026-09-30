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

  return { done, total };
}

export function TaskProgressBar({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  if (total <= 0) return null;

  const percent = Math.round((done / total) * 100);
  const complete = done === total;

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
}

const DayProgress: FC<Props> = ({ tasks }) => {
  const { done, total } = dayProgressStats(tasks);
  return <TaskProgressBar done={done} total={total} />;
};

export default DayProgress;
