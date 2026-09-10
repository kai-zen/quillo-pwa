"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useProgressesApi } from "@/shared/hooks";
import type {
  CreateProgressBody,
  Progress,
  ProgressInputType,
} from "@/shared/types";

export type ProgressFormMode =
  | { type: "create" }
  | { type: "edit"; progress: Progress };

export interface ChoiceOptionItem {
  key: string;
  value: string;
}

const newChoiceOption = (value = ""): ChoiceOptionItem => ({
  key: crypto.randomUUID(),
  value,
});

const choiceOptionsFromProgress = (progress: Progress): ChoiceOptionItem[] => {
  const options = progress.choice_options ?? [];
  if (options.length === 0) return [newChoiceOption(), newChoiceOption()];
  return options.map((value) => newChoiceOption(value));
};

const parseRangeValue = (value: string): number | null => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function useProgressForm(
  mode: ProgressFormMode,
  onSaved: (result?: { deleted?: boolean }) => void,
) {
  const {
    createProgress,
    updateProgress,
    deleteProgress,
    isCreating,
    isUpdating,
    isDeleting,
  } = useProgressesApi();

  const editing = mode.type === "edit" ? mode.progress : null;

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [inputType, setInputTypeState] = useState<ProgressInputType>(
    editing?.input_type ?? "boolean",
  );
  const [choiceOptions, setChoiceOptions] = useState<ChoiceOptionItem[]>(() =>
    editing ? choiceOptionsFromProgress(editing) : [newChoiceOption(), newChoiceOption()],
  );
  const [rangeMin, setRangeMin] = useState(
    editing?.number_range?.[0] !== undefined
      ? String(editing.number_range[0])
      : "",
  );
  const [rangeMax, setRangeMax] = useState(
    editing?.number_range?.[1] !== undefined
      ? String(editing.number_range[1])
      : "",
  );
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;

  const setInputType = (next: ProgressInputType) => {
    setInputTypeState(next);
    if (next === "choice" && choiceOptions.length === 0) {
      setChoiceOptions([newChoiceOption(), newChoiceOption()]);
    }
    if (next === "rating" && !rangeMin && !rangeMax) {
      setRangeMin("1");
      setRangeMax("5");
    }
  };

  const addChoiceOption = () => {
    const last = choiceOptions[choiceOptions.length - 1];
    if (last && !last.value.trim()) return last.key;
    const option = newChoiceOption();
    setChoiceOptions((current) => [...current, option]);
    return option.key;
  };

  const removeChoiceOption = (key: string) => {
    setChoiceOptions((current) => current.filter((item) => item.key !== key));
  };

  const updateChoiceOption = (key: string, value: string) => {
    setChoiceOptions((current) =>
      current.map((item) => (item.key === key ? { ...item, value } : item)),
    );
  };

  const buildBody = (): CreateProgressBody | null => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return null;
    }

    const body: CreateProgressBody = {
      title: trimmedTitle,
      description: description.trim(),
      input_type: inputType,
    };

    if (inputType === "choice") {
      const options = choiceOptions
        .map((item) => item.value.trim())
        .filter(Boolean);
      if (options.length < 2) {
        setError("Choice trackers need at least two options.");
        return null;
      }
      if (new Set(options).size !== options.length) {
        setError("Choice options must be unique.");
        return null;
      }
      body.choice_options = options;
    }

    if (inputType === "number" || inputType === "rating") {
      const min = parseRangeValue(rangeMin);
      const max = parseRangeValue(rangeMax);
      if (min === null || max === null) {
        setError("Min and max are required.");
        return null;
      }
      if (min >= max) {
        setError("Min must be less than max.");
        return null;
      }
      body.number_range = [min, max];
    }

    return body;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const body = buildBody();
    if (!body) return;

    try {
      if (editing) {
        await updateProgress(editing._id, body);
      } else {
        await createProgress(body);
      }
      onSaved();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing
            ? "Could not update progress."
            : "Could not create progress.",
        ),
      );
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    if (
      !window.confirm(
        `Delete “${editing.title}”? Recorded values and sprint tracking for this progress will also be removed.`,
      )
    ) {
      return;
    }

    setError("");
    try {
      await deleteProgress(editing._id);
      onSaved({ deleted: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete progress."));
    }
  };

  return {
    editing,
    title,
    setTitle,
    description,
    setDescription,
    inputType,
    setInputType,
    choiceOptions,
    addChoiceOption,
    removeChoiceOption,
    updateChoiceOption,
    rangeMin,
    setRangeMin,
    rangeMax,
    setRangeMax,
    error,
    pending,
    onSubmit,
    onDelete,
  };
}
