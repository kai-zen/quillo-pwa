"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useGoalsApi } from "@/shared/hooks";
import type {
  GoalDetail,
  GoalObjective,
  GoalStatus,
  RecordId,
} from "@/shared/types";
import type { GoalFormMode } from "../form/GoalForm";
import type { SprintFormMode } from "@/components/sprints";
import { toUpdateBody } from "../helpers";

export function useGoalDetail(goalId: RecordId) {
  const router = useRouter();
  const { useGoal, toggleObjective, updateGoal } = useGoalsApi();

  const [goalFormMode, setGoalFormMode] = useState<GoalFormMode | null>(null);
  const [sprintFormMode, setSprintFormMode] = useState<SprintFormMode | null>(
    null,
  );
  const [pendingObjectiveId, setPendingObjectiveId] = useState<RecordId | null>(
    null,
  );
  const [pendingStatus, setPendingStatus] = useState(false);
  const [actionError, setActionError] = useState("");

  const goalQuery = useGoal(goalId);
  const goal: GoalDetail | null = goalQuery.data ?? null;
  const sprints = goal?.sprints ?? [];

  const isGoalLoading = goalQuery.isLoading;
  const isGoalError = goalQuery.isError;
  const isGoalMissing = !isGoalLoading && !isGoalError && !goal;

  const openEditGoal = () => {
    if (!goal) return;
    setGoalFormMode({ type: "edit", goal });
  };
  const closeGoalForm = () => setGoalFormMode(null);

  const openCreateSprint = () => {
    if (!goal) return;
    setSprintFormMode({ type: "create", goalId: goal._id });
  };
  const closeSprintForm = () => setSprintFormMode(null);
  const onSprintSaved = () => setSprintFormMode(null);

  const onGoalSaved = (result?: { deleted?: boolean }) => {
    setGoalFormMode(null);
    if (result?.deleted) router.push("/goals");
  };

  const onToggleObjective = async (objective: GoalObjective) => {
    if (pendingObjectiveId) return;
    setActionError("");
    setPendingObjectiveId(objective._id);
    try {
      await toggleObjective(goalId, objective._id);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update objective."));
    } finally {
      setPendingObjectiveId(null);
    }
  };

  const onChangeStatus = async (status: GoalStatus) => {
    if (!goal || pendingStatus || goal.status === status) return;
    setActionError("");
    setPendingStatus(true);
    try {
      await updateGoal(goal._id, {
        ...toUpdateBody(goal),
        status,
      });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update goal status."));
    } finally {
      setPendingStatus(false);
    }
  };

  return {
    goalId,
    goal,
    sprints,
    goalFormMode,
    sprintFormMode,
    pendingObjectiveId,
    pendingStatus,
    actionError,
    isGoalLoading,
    isGoalError,
    isGoalMissing,
    openEditGoal,
    closeGoalForm,
    openCreateSprint,
    closeSprintForm,
    onSprintSaved,
    onGoalSaved,
    onToggleObjective,
    onChangeStatus,
  };
}

export type GoalDetailViewModel = ReturnType<typeof useGoalDetail>;
