"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useGoalsApi, useSprintsApi } from "@/shared/hooks";
import type { CreateSprintBody, Goal, RecordId, Sprint, SprintStatus } from "@/shared/types";
import { toDateInputValue, toUpdateBody } from "../helpers";

export type SprintFormMode =
  | { type: "create" }
  | { type: "edit"; sprint: Sprint };

export function useSprintForm(
  mode: SprintFormMode,
  onSaved: (result?: { deleted?: boolean }) => void,
) {
  const { createSprint, updateSprint, deleteSprint, isCreating, isUpdating, isDeleting } =
    useSprintsApi();
  const { useGoalsList } = useGoalsApi();
  const goalsQuery = useGoalsList({ page: 1, limit: 100 });

  const editing = mode.type === "edit" ? mode.sprint : null;
  const goals: Goal[] = goalsQuery.data?.items ?? [];

  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [startDate, setStartDate] = useState(
    toDateInputValue(editing?.start_date),
  );
  const [endDate, setEndDate] = useState(toDateInputValue(editing?.end_date));
  const [goalId, setGoalId] = useState<RecordId | "">(editing?.goal_id ?? "");
  const [status, setStatus] = useState<SprintStatus>(
    editing?.status ?? "planned",
  );
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;
  const goalsLoading = goalsQuery.isLoading;

  const buildBody = (): CreateSprintBody => ({
    name: name.trim(),
    description: description.trim(),
    start_date: startDate,
    end_date: endDate,
    status,
    goal_id: goalId || null,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const body = buildBody();
    if (!body.name) {
      setError("Name is required.");
      return;
    }
    if (!body.start_date || !body.end_date) {
      setError("Start and end dates are required.");
      return;
    }
    if (body.start_date > body.end_date) {
      setError("Start date must be on or before end date.");
      return;
    }

    try {
      if (editing) {
        await updateSprint(editing._id, {
          ...toUpdateBody(editing),
          ...body,
        });
      } else {
        await createSprint(body);
      }
      onSaved();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing ? "Could not update sprint." : "Could not create sprint.",
        ),
      );
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    if (!window.confirm(`Delete “${editing.name}”? Tasks stay, but leave this sprint.`)) {
      return;
    }

    setError("");
    try {
      await deleteSprint(editing._id);
      onSaved({ deleted: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete sprint."));
    }
  };

  return {
    editing,
    name,
    setName,
    description,
    setDescription,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    goalId,
    setGoalId,
    goals,
    goalsLoading,
    status,
    setStatus,
    error,
    pending,
    onSubmit,
    onDelete,
  };
}
