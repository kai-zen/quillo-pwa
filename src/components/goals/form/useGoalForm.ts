"use client";

import { useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useGoalsApi } from "@/shared/hooks";
import type {
  CreateGoalBody,
  Goal,
  GoalObjectiveBody,
  GoalStatus,
} from "@/shared/types";
import { toDateInputValue, toUpdateBody } from "../helpers";

export type GoalFormMode = { type: "create" } | { type: "edit"; goal: Goal };

export interface ObjectiveFormItem {
  key: string;
  objectiveId?: string;
  title: string;
  description: string;
  completed?: boolean;
}

const newObjective = (): ObjectiveFormItem => ({
  key: crypto.randomUUID(),
  title: "",
  description: "",
});

const isBlankObjective = (item: ObjectiveFormItem) =>
  !item.title.trim() && !item.description.trim();

const objectivesFromGoal = (goal: Goal): ObjectiveFormItem[] => {
  if (goal.objectives.length === 0) return [];
  return goal.objectives.map((objective) => ({
    key: crypto.randomUUID(),
    objectiveId: objective._id,
    title: objective.title,
    description: objective.description,
    completed: objective.completed,
  }));
};

export function useGoalForm(
  mode: GoalFormMode,
  onSaved: (result?: { deleted?: boolean }) => void,
) {
  const {
    createGoal,
    updateGoal,
    deleteGoal,
    isCreating,
    isUpdating,
    isDeleting,
  } = useGoalsApi();

  const editing = mode.type === "edit" ? mode.goal : null;

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [startDate, setStartDate] = useState(
    toDateInputValue(editing?.start_date),
  );
  const [targetDate, setTargetDate] = useState(
    toDateInputValue(editing?.target_date),
  );
  const [status, setStatus] = useState<GoalStatus>(editing?.status ?? "active");
  const [objectives, setObjectives] = useState<ObjectiveFormItem[]>(() =>
    editing ? objectivesFromGoal(editing) : [],
  );
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;

  const addObjective = () => {
    const item = newObjective();
    setObjectives((current) => [...current, item]);
    return item.key;
  };

  const removeObjective = (key: string) => {
    setObjectives((current) => current.filter((item) => item.key !== key));
  };

  const updateObjective = (key: string, patch: Partial<ObjectiveFormItem>) => {
    setObjectives((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  };

  const buildObjectivesBody = (): GoalObjectiveBody[] =>
    objectives
      .filter((item) => !isBlankObjective(item))
      .map((item) => ({
        ...(item.objectiveId ? { _id: item.objectiveId } : {}),
        title: item.title.trim(),
        description: item.description.trim(),
        ...(item.objectiveId && item.completed !== undefined
          ? { completed: item.completed }
          : {}),
      }));

  const buildBody = (): CreateGoalBody => ({
    title: title.trim(),
    description: description.trim(),
    status,
    start_date: startDate || null,
    target_date: targetDate || null,
    objectives: buildObjectivesBody(),
  });

  const onSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    const body = buildBody();
    if (!body.title) {
      setError("Title is required.");
      return;
    }
    if (
      body.start_date &&
      body.target_date &&
      body.start_date > body.target_date
    ) {
      setError("Start date must be on or before target date.");
      return;
    }

    try {
      if (editing) {
        await updateGoal(editing._id, {
          ...toUpdateBody(editing),
          ...body,
        });
      } else {
        await createGoal(body);
      }
      onSaved();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing ? "Could not update goal." : "Could not create goal.",
        ),
      );
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    if (
      !window.confirm(
        `Delete “${editing.title}”? Linked sprints keep their tasks but lose this goal.`,
      )
    ) {
      return;
    }

    setError("");
    try {
      await deleteGoal(editing._id);
      onSaved({ deleted: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete goal."));
    }
  };

  return {
    editing,
    title,
    setTitle,
    description,
    setDescription,
    startDate,
    setStartDate,
    targetDate,
    setTargetDate,
    status,
    setStatus,
    objectives,
    addObjective,
    removeObjective,
    updateObjective,
    error,
    pending,
    onSubmit,
    onDelete,
  };
}
