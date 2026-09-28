"use client";

import { FC } from "react";
import { cn } from "@/components/common";
import type { Goal, GoalObjective, RecordId } from "@/shared/types";
import GoalObjectiveSection from "./GoalObjectiveSection";
import { objectiveCompletionStats, objectiveProgress } from "./helpers";

interface Props {
  goal: Goal;
  pendingObjectiveId: RecordId | null;
  actionError: string;
  onToggleObjective: (objective: GoalObjective) => void;
}

const GoalObjectivesPanel: FC<Props> = ({
  goal,
  pendingObjectiveId,
  actionError,
  onToggleObjective,
}) => {
  const { completedCount, totalObjectives, progressPercent, progressComplete } =
    objectiveCompletionStats(goal);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Objectives</p>
          <p className="mt-0.5 text-sm text-muted">
            Milestones that define what success looks like for this goal.
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted">
          {objectiveProgress(goal)}
        </span>
      </div>

      {totalObjectives > 0 && (
        <div className="h-2 overflow-hidden rounded-full bg-accent-soft">
          <div
            className={cn(
              "h-full rounded-full transition-[width,background-color] duration-500 ease-out",
              progressComplete
                ? "bg-emerald-500"
                : progressPercent === 0
                  ? "bg-transparent"
                  : "bg-foreground",
            )}
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalObjectives}
            aria-label="Objective completion"
          />
        </div>
      )}

      {actionError ? (
        <p className="text-sm text-foreground">{actionError}</p>
      ) : null}

      {totalObjectives === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
          <p className="font-medium text-foreground">No objectives yet</p>
          <p className="mt-1 text-sm text-muted">
            Edit this goal to add objectives that describe what you are working
            toward.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {goal.objectives.map((objective) => (
            <GoalObjectiveSection
              key={objective._id}
              objective={objective}
              pending={pendingObjectiveId === objective._id}
              onToggle={onToggleObjective}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalObjectivesPanel;
