"use client";

import { FC } from "react";
import { Markdown, cn } from "@/components/common";
import type { GoalObjective } from "@/shared/types";

interface Props {
  objective: GoalObjective;
  pending: boolean;
  onToggle: (objective: GoalObjective) => void;
}

const GoalObjectiveSection: FC<Props> = ({ objective, pending, onToggle }) => {
  const done = objective.completed;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface",
        done && "bg-accent-soft/30",
      )}
    >
      <div
        className={cn(
          "border-l-4 px-5 py-4",
          done ? "border-l-emerald-500" : "border-l-border",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h3
            className={cn(
              "min-w-0 text-base font-semibold text-foreground",
              done && "text-muted",
            )}
          >
            {objective.title}
          </h3>
          <button
            type="button"
            disabled={pending}
            aria-pressed={done}
            aria-label={
              done
                ? `Mark objective “${objective.title}” as incomplete`
                : `Mark objective “${objective.title}” as complete`
            }
            onClick={() => onToggle(objective)}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
              "disabled:cursor-not-allowed disabled:opacity-50",
              done
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-accent-soft text-muted hover:text-foreground",
            )}
          >
            {done ? "Completed" : "Mark complete"}
          </button>
        </div>
        {objective.description ? (
          <div className="mt-3 min-w-0">
            <Markdown className={done ? "text-muted" : undefined}>
              {objective.description}
            </Markdown>
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default GoalObjectiveSection;
