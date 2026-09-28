"use client";

import { Pencil } from "lucide-react";
import { FC } from "react";
import {
  IconButton,
  Markdown,
  PageHeader,
  cn,
} from "@/components/common";
import { LinkedNotes } from "@/components/notes";
import GoalDetailModals from "./GoalDetailModals";
import GoalObjectivesPanel from "./GoalObjectivesPanel";
import GoalSprintsPanel from "./GoalSprintsPanel";
import {
  formatGoalHeaderDescription,
  GOAL_STATUS_BADGE_CLASS,
  GOAL_STATUS_DOT_CLASS,
  GOAL_STATUS_LABELS,
} from "./helpers";
import { useGoalDetail } from "./hooks/useGoalDetail";

interface Props {
  goalId: string;
}

const GoalDetail: FC<Props> = ({ goalId }) => {
  const view = useGoalDetail(goalId);
  const {
    goal,
    sprints,
    pendingObjectiveId,
    actionError,
    isGoalLoading,
    isGoalError,
    isGoalMissing,
    openEditGoal,
    openCreateSprint,
    onToggleObjective,
  } = view;

  if (isGoalLoading)
    return (
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm text-muted">Loading goal…</p>
      </div>
    );

  if (isGoalError || isGoalMissing || !goal)
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title={
          <span className="inline-flex flex-wrap items-center gap-2.5">
            <span>{goal.title}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                GOAL_STATUS_BADGE_CLASS[goal.status],
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  GOAL_STATUS_DOT_CLASS[goal.status],
                )}
                aria-hidden
              />
              {GOAL_STATUS_LABELS[goal.status]}
            </span>
          </span>
        }
        description={formatGoalHeaderDescription(
          goal.start_date,
          goal.target_date,
        )}
        back={{ href: "/goals", label: "All goals" }}
        actions={
          <IconButton label="Edit goal" onClick={openEditGoal}>
            <Pencil className="h-4 w-4" aria-hidden />
          </IconButton>
        }
      >
        {goal.description ? <Markdown>{goal.description}</Markdown> : null}
      </PageHeader>

      <GoalObjectivesPanel
        goal={goal}
        pendingObjectiveId={pendingObjectiveId}
        actionError={actionError}
        onToggleObjective={onToggleObjective}
      />

      <GoalSprintsPanel sprints={sprints} onCreateSprint={openCreateSprint} />

      <LinkedNotes of={goal.title} goalId={goalId} />

      <GoalDetailModals view={view} />
    </div>
  );
};

export default GoalDetail;
