"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useRoutinesApi } from "@/shared/hooks";
import type {
  CreateRoutineBody,
  DayOfWeek,
  RecordId,
  Routine,
  RoutineRepeat,
  TaskPriority,
} from "@/shared/types";
import { toUpdateBody } from "../helpers";

export type RoutineFormMode =
  | { type: "create" }
  | { type: "edit"; routine: Routine };

export interface DraftFormItem {
  key: string;
  title: string;
  priority: TaskPriority;
  description: string;
  labelIds: RecordId[];
}

const newDraft = (): DraftFormItem => ({
  key: crypto.randomUUID(),
  title: "",
  priority: "unset",
  description: "",
  labelIds: [],
});

const draftsFromRoutine = (routine: Routine): DraftFormItem[] => {
  if (routine.drafts.length === 0) return [newDraft()];
  return routine.drafts.map((draft) => ({
    key: crypto.randomUUID(),
    title: draft.title,
    priority: draft.priority,
    description: draft.description,
    labelIds: draft.label_ids,
  }));
};

export function useRoutineForm(
  mode: RoutineFormMode,
  onSaved: (result?: { deleted?: boolean }) => void,
) {
  const {
    createRoutine,
    updateRoutine,
    deleteRoutine,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRoutinesApi();

  const editing = mode.type === "edit" ? mode.routine : null;

  const [name, setName] = useState(editing?.name ?? "");
  const [repeat, setRepeat] = useState<RoutineRepeat>(
    editing?.repeat ?? "everyday",
  );
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(
    editing?.days_of_week ?? [],
  );
  const [drafts, setDrafts] = useState<DraftFormItem[]>(() =>
    editing ? draftsFromRoutine(editing) : [newDraft()],
  );
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [labelDraftName, setLabelDraftName] = useState("");
  const [labelManagerDraftKey, setLabelManagerDraftKey] = useState<
    string | null
  >(null);
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;

  const toggleDay = (day: DayOfWeek) => {
    setDaysOfWeek((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
  };

  const addDraft = () => setDrafts((current) => [...current, newDraft()]);

  const removeDraft = (key: string) => {
    setDrafts((current) => current.filter((draft) => draft.key !== key));
  };

  const updateDraft = (key: string, patch: Partial<DraftFormItem>) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === key ? { ...draft, ...patch } : draft,
      ),
    );
  };

  const openLabelCreate = (draftKey: string, draftName: string) => {
    setLabelManagerDraftKey(draftKey);
    setLabelDraftName(draftName);
    setLabelManagerOpen(true);
  };

  const closeLabelManager = () => {
    setLabelManagerOpen(false);
    setLabelManagerDraftKey(null);
  };

  const onLabelCreated = (id: RecordId) => {
    if (!labelManagerDraftKey) return;
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === labelManagerDraftKey && !draft.labelIds.includes(id)
          ? { ...draft, labelIds: [...draft.labelIds, id] }
          : draft,
      ),
    );
  };

  const onLabelDeleted = (id: RecordId) => {
    setDrafts((current) =>
      current.map((draft) => ({
        ...draft,
        labelIds: draft.labelIds.filter((item) => item !== id),
      })),
    );
  };

  const buildBody = (): CreateRoutineBody | null => {
    const titled = drafts.filter((draft) => draft.title.trim());
    const incomplete = drafts.some(
      (draft) =>
        !draft.title.trim() &&
        (draft.description.trim() ||
          draft.labelIds.length > 0 ||
          draft.priority !== "unset"),
    );

    if (!name.trim()) {
      setError("Name is required.");
      return null;
    }
    if (repeat === "weekly" && daysOfWeek.length === 0) {
      setError("Pick at least one day for a weekly routine.");
      return null;
    }
    if (incomplete) {
      setError("Every draft needs a title.");
      return null;
    }
    if (titled.length === 0) {
      setError("Add at least one draft.");
      return null;
    }

    return {
      name: name.trim(),
      repeat,
      days_of_week: repeat === "everyday" ? [] : daysOfWeek,
      drafts: titled.map((draft) => ({
        title: draft.title.trim(),
        priority: draft.priority,
        description: draft.description.trim(),
        label_ids: draft.labelIds,
      })),
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const body = buildBody();
    if (!body) return;

    try {
      if (editing) {
        await updateRoutine(editing._id, {
          ...toUpdateBody(editing),
          ...body,
        });
      } else {
        await createRoutine(body);
      }
      onSaved();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing ? "Could not update routine." : "Could not create routine.",
        ),
      );
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    if (!window.confirm(`Delete “${editing.name}”?`)) return;

    setError("");
    try {
      await deleteRoutine(editing._id);
      onSaved({ deleted: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete routine."));
    }
  };

  return {
    editing,
    name,
    setName,
    repeat,
    setRepeat,
    daysOfWeek,
    toggleDay,
    drafts,
    addDraft,
    removeDraft,
    updateDraft,
    labelManagerOpen,
    labelDraftName,
    error,
    pending,
    openLabelCreate,
    closeLabelManager,
    onLabelCreated,
    onLabelDeleted,
    onSubmit,
    onDelete,
  };
}
