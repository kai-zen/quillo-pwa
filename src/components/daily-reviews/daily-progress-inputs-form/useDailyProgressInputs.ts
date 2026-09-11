"use client";

import { useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useProgressInputsApi } from "@/shared/hooks";
import type { Progress, ProgressInput, RecordId } from "@/shared/types";

export type ProgressDraftValue = boolean | number | string | null;

const isValueFilled = (progress: Progress, value: ProgressDraftValue): boolean => {
  if (value === null || value === "") return false;
  if (progress.input_type === "boolean") return typeof value === "boolean";
  if (progress.input_type === "choice") return typeof value === "string";
  if (
    progress.input_type === "number" ||
    progress.input_type === "rating" ||
    progress.input_type === "duration"
  ) {
    return typeof value === "number" && !Number.isNaN(value);
  }
  return false;
};

const validateValue = (
  progress: Progress,
  value: ProgressDraftValue,
): string | null => {
  if (!isValueFilled(progress, value)) {
    return "Enter a value for this tracker.";
  }

  if (
    (progress.input_type === "number" || progress.input_type === "rating") &&
    typeof value === "number"
  ) {
    const [min, max] = progress.number_range ?? [];
    if (min !== undefined && value < min) {
      return `Value must be at least ${min}.`;
    }
    if (max !== undefined && value > max) {
      return `Value must be at most ${max}.`;
    }
  }

  if (progress.input_type === "duration" && typeof value === "number" && value < 0) {
    return "Duration cannot be negative.";
  }

  if (progress.input_type === "choice" && typeof value === "string") {
    const options = progress.choice_options ?? [];
    if (options.length > 0 && !options.includes(value)) {
      return "Pick one of the available options.";
    }
  }

  return null;
};

const useDailyProgressInputs = (
  date: string,
  progresses: Progress[],
  enabled: boolean,
) => {
  const {
    useProgressInputsByDate,
    createProgressInput,
    updateProgressInput,
    isCreating,
    isUpdating,
  } = useProgressInputsApi();

  const inputsQuery = useProgressInputsByDate(date, enabled && !!date);
  const existingByProgressId = useMemo(() => {
    const map = new Map<RecordId, ProgressInput>();
    for (const item of inputsQuery.data?.items ?? []) {
      map.set(item.progress_id, item);
    }
    return map;
  }, [inputsQuery.data?.items]);

  const [values, setValues] = useState<Record<RecordId, ProgressDraftValue>>(
    {},
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return;
    const next: Record<RecordId, ProgressDraftValue> = {};
    for (const progress of progresses) {
      const existing = existingByProgressId.get(progress._id);
      next[progress._id] = existing?.value ?? null;
    }
    setValues(next);
    setError("");
  }, [enabled, progresses, existingByProgressId]);

  const pending = isCreating || isUpdating;
  const isLoading = enabled && inputsQuery.isLoading;
  const isError = enabled && inputsQuery.isError;

  const setValue = (progressId: RecordId, value: ProgressDraftValue) => {
    setValues((current) => ({ ...current, [progressId]: value }));
    setError("");
  };

  const onSubmit = async (event: SubmitEvent): Promise<boolean> => {
    event.preventDefault();
    if (pending) return false;
    setError("");

    for (const progress of progresses) {
      const message = validateValue(progress, values[progress._id] ?? null);
      if (message) {
        setError(message);
        return false;
      }
    }

    try {
      await Promise.all(
        progresses.map(async (progress) => {
          const value = values[progress._id];
          if (value === null || value === "") return;

          const body = {
            progress_id: progress._id,
            date,
            value,
          };
          const existing = existingByProgressId.get(progress._id);
          if (existing) await updateProgressInput(existing._id, body);
          else await createProgressInput(body);
        }),
      );
      return true;
    } catch (err) {
      setError(getErrorMessage(err, "Could not save progress for this day."));
      return false;
    }
  };

  return {
    values,
    error,
    pending,
    isLoading,
    isError,
    setValue,
    onSubmit,
  };
};

export default useDailyProgressInputs;
