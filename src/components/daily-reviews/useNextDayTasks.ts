"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";

const PAGE_LIMIT = 50;

export function useNextDayTasks(nextDate: string) {
  const { useTasksList, createTask, isCreating } = useTasksApi();
  const query = useTasksList({
    page: 1,
    limit: PAGE_LIMIT,
    doing_date: nextDate,
  });

  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const addTask = async (event?: FormEvent) => {
    event?.preventDefault();
    const title = draft.trim();
    if (!title || isCreating) return;
    setError("");

    try {
      await createTask({
        title,
        doing_date: nextDate,
        status: "todo",
      });
      setDraft("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not add this task."));
    }
  };

  return {
    tasks: query.data?.items ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    draft,
    setDraft,
    addTask,
    pending: isCreating,
    error,
  };
}
