"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import {
  useGoalsApi,
  useLabelsApi,
  useNotesApi,
  useSprintsApi,
} from "@/shared/hooks";
import type { CreateNoteBody, Note, RecordId } from "@/shared/types";
import { toDateInputValue, toUpdateBody } from "../helpers";

export type NoteCreateContext = {
  folderId?: RecordId | null;
  date?: string | null;
  goalId?: RecordId | null;
  sprintId?: RecordId | null;
};

export type NoteFormMode =
  | ({ type: "create" } & NoteCreateContext)
  | { type: "edit"; note: Note };

export type NoteModalMode =
  | ({ type: "create" } & NoteCreateContext)
  | { type: "view"; note: Note };

export type NoteSaveResult = { deleted?: boolean; note?: Note };

export function useNoteForm(
  mode: NoteFormMode,
  onSaved: (result?: NoteSaveResult) => void,
) {
  const {
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting,
  } = useNotesApi();
  const { useLabelsList } = useLabelsApi();
  const { useGoal } = useGoalsApi();
  const { useSprint } = useSprintsApi();

  const editing = mode.type === "edit" ? mode.note : null;
  const create = mode.type === "create" ? mode : null;

  const initialFolderId = editing?.folder_id ?? create?.folderId ?? null;
  const initialGoalId = editing?.goal_id ?? create?.goalId ?? null;
  const initialSprintId = editing?.sprint_id ?? create?.sprintId ?? null;
  const initialDate = toDateInputValue(editing?.date ?? create?.date ?? null);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [content, setContent] = useState(editing?.content ?? "");
  const folderId = initialFolderId ?? "";
  const [labelIds, setLabelIds] = useState<RecordId[]>(
    editing?.label_ids ?? [],
  );
  const [goalId, setGoalId] = useState<RecordId | "">(initialGoalId ?? "");
  const [sprintId, setSprintId] = useState<RecordId | "">(
    initialSprintId ?? "",
  );
  const [date, setDate] = useState(initialDate);
  const [pinned, setPinned] = useState(editing?.pinned ?? false);
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [labelDraftName, setLabelDraftName] = useState("");
  const [error, setError] = useState("");

  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const goalQuery = useGoal(goalId, !!goalId);
  const sprintQuery = useSprint(sprintId, !!sprintId);

  const pending = isCreating || isUpdating || isDeleting;
  const labels = labelsQuery.data?.items ?? [];
  const goalTitle = goalQuery.data?.title ?? "";
  const sprintName = sprintQuery.data?.name ?? "";

  const openLabelCreate = (draftName: string) => {
    setLabelDraftName(draftName);
    setLabelManagerOpen(true);
  };

  const closeLabelManager = () => setLabelManagerOpen(false);

  const onLabelCreated = (id: RecordId) => {
    setLabelIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const onLabelDeleted = (id: RecordId) => {
    setLabelIds((current) => current.filter((item) => item !== id));
  };

  const buildBody = (): CreateNoteBody => ({
    title: title.trim(),
    content,
    folder_id: folderId || null,
    label_ids: labelIds,
    goal_id: goalId || null,
    sprint_id: sprintId || null,
    date: date || null,
    pinned,
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const body = buildBody();
    if (!body.title) {
      setError("Title is required.");
      return;
    }

    try {
      if (editing) {
        const note = await updateNote(editing._id, {
          ...toUpdateBody(editing),
          ...body,
        });
        onSaved({ note });
      } else {
        const note = await createNote(body);
        onSaved({ note });
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing ? "Could not update note." : "Could not create note.",
        ),
      );
    }
  };

  const onDelete = async () => {
    if (!editing) return;

    setError("");
    try {
      await deleteNote(editing._id);
      onSaved({ deleted: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete note."));
    }
  };

  return {
    editing,
    title,
    setTitle,
    content,
    setContent,
    labelIds,
    setLabelIds,
    labels,
    goalId,
    goalTitle,
    clearGoal: () => setGoalId(""),
    sprintId,
    sprintName,
    clearSprint: () => setSprintId(""),
    date,
    clearDate: () => setDate(""),
    pinned,
    setPinned,
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
