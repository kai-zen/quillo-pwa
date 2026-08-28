"use client";

import { Check, Pencil } from "lucide-react";
import { FC } from "react";
import {
  IconButton,
  Markdown,
  Modal,
  PageHeader,
  Select,
  cn,
} from "@/components/common";
import type { GoalObjective, GoalStatus } from "@/shared/types";
import GoalForm, { goalFormTitle } from "./form/GoalForm";
import {
  formatGoalRange,
  GOAL_STATUS_LABELS,
  GOAL_STATUS_OPTIONS,
  objectiveProgress,
} from "./helpers";
import { useGoalDetail } from "./hooks/useGoalDetail";

interface Props {
  goalId: string;
}

const ObjectiveRow: FC<{
  objective: GoalObjective;
  pending: boolean;
  onToggle: (objective: GoalObjective) => void;
}> = ({ objective, pending, onToggle }) => {
  const done = objective.completed;

  return (
    <li className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={
          done
            ? `Mark objective “${objective.title}” as incomplete`
            : `Mark objective “${objective.title}” as complete`
        }
        disabled={pending}
        onClick={() => onToggle(objective)}
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
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium text-foreground",
            done && "line-through opacity-70",
          )}
        >
          {objective.title}
        </p>
        {objective.description ? (
          <p className="mt-1 text-sm text-muted">{objective.description}</p>
        ) : null}
      </div>
    </li>
  );
};

const GoalDetail: FC<Props> = ({ goalId }) => {
  const view = useGoalDetail(goalId);
  const {
    goal,
    goalFormMode,
    pendingObjectiveId,
    pendingStatus,
    actionError,
    isGoalLoading,
    isGoalError,
    isGoalMissing,
    openEditGoal,
    closeGoalForm,
    onGoalSaved,
    onToggleObjective,
    onChangeStatus,
  } = view;

  if (isGoalLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm text-muted">Loading goal…</p>
      </div>
    );
  }

  if (isGoalError || isGoalMissing || !goal) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          title={isGoalError ? "Could not load goal" : "Goal not found"}
          description={
            isGoalError
              ? "Try refreshing the page."
              : "This goal may have been deleted."
          }
          back={{ href: "/goals", label: "All goals" }}
        />
      </div>
    );
  }

  const completedCount = goal.objectives.filter(
    (item) => item.completed,
  ).length;
  const totalObjectives = goal.objectives.length;
  const progressPercent =
    totalObjectives > 0
      ? Math.round((completedCount / totalObjectives) * 100)
      : 0;
  const progressComplete =
    totalObjectives > 0 && completedCount === totalObjectives;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title={goal.title}
        description={formatGoalRange(goal.start_date, goal.target_date)}
        back={{ href: "/goals", label: "All goals" }}
        actions={
          <IconButton label="Edit goal" onClick={openEditGoal}>
            <Pencil className="h-4 w-4" aria-hidden />
          </IconButton>
        }
      >
        {goal.description ? (
          <Markdown compact>{goal.description}</Markdown>
        ) : null}
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3 bg-surface shadow-sm shadow-black/2">
        <label className="pl-1 text-sm text-foreground" htmlFor="goal-status">
          Status:
        </label>
        <Select
          id="goal-status"
          value={goal.status}
          onChange={(event) => onChangeStatus(event.target.value as GoalStatus)}
          disabled={pendingStatus}
          sizeVariant="sm"
          className="w-40"
          aria-label="Goal status"
        >
          {GOAL_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {GOAL_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </div>

      <Modal
        open={!!goalFormMode}
        onClose={closeGoalForm}
        title={goalFormMode ? goalFormTitle(goalFormMode) : ""}
        className="max-w-3xl"
      >
        {goalFormMode && (
          <GoalForm
            key={
              goalFormMode.type === "edit" ? goalFormMode.goal._id : "create"
            }
            mode={goalFormMode}
            onClose={closeGoalForm}
            onSaved={onGoalSaved}
          />
        )}
      </Modal>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">Objectives</p>
          <span className="text-xs font-medium tabular-nums text-muted">
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

        {actionError && (
          <p className="text-sm text-foreground">{actionError}</p>
        )}

        {totalObjectives === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
            <p className="font-medium text-foreground">No objectives yet</p>
            <p className="mt-1 text-sm text-muted">
              Edit this goal to add checklist steps.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {goal.objectives.map((objective) => (
              <ObjectiveRow
                key={objective._id}
                objective={objective}
                pending={pendingObjectiveId === objective._id}
                onToggle={onToggleObjective}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GoalDetail;
