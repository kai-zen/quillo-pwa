"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useGoalsApi, useNotesApi, useSprintsApi } from "@/shared/hooks";
import type {
  CreateNoteBody,
  Goal,
  Note,
  RecordId,
  Sprint,
} from "@/shared/types";
import { toDateInputValue, toUpdateBody } from "../helpers";

export type NoteFormMode =
  | { type: "create"; folderId?: RecordId | null }
  | { type: "edit"; note: Note };

export function useNoteForm(
  mode: NoteFormMode,
  onSaved: (result?: { deleted?: boolean }) => void,
) {
  const {
    createNote,
    updateNote,
    deleteNote,
    isCreating,
    isUpdating,
    isDeleting,
  } = useNotesApi();
  const { useGoalsList } = useGoalsApi();
  const { useSprintsList } = useSprintsApi();

  const goalsQuery = useGoalsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });

  const editing = mode.type === "edit" ? mode.note : null;
  const goals: Goal[] = goalsQuery.data?.items ?? [];
  const sprints: Sprint[] = sprintsQuery.data?.items ?? [];

  const initialFolderId =
    editing?.folder_id ??
    (mode.type === "create" ? (mode.folderId ?? null) : null);

  const [title, setTitle] = useState(editing?.title ?? "");
  const [content, setContent] = useState(editing?.content ?? "");
  const [folderId, setFolderId] = useState<RecordId | "">(
    initialFolderId ?? "",
  );
  const [labelIds, setLabelIds] = useState<RecordId[]>(
    editing?.label_ids ?? [],
  );
  const [goalId, setGoalId] = useState<RecordId | "">(editing?.goal_id ?? "");
  const [sprintId, setSprintId] = useState<RecordId | "">(
    editing?.sprint_id ?? "",
  );
  const [date, setDate] = useState(toDateInputValue(editing?.date));
  const [pinned, setPinned] = useState(editing?.pinned ?? false);
  const [archived, setArchived] = useState(editing?.archived ?? false);
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [labelDraftName, setLabelDraftName] = useState("");
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;

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
    content: content.trim(),
    folder_id: folderId || null,
    label_ids: labelIds,
    goal_id: goalId || null,
    sprint_id: sprintId || null,
    date: date || null,
    pinned,
    archived: editing ? archived : false,
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
        await updateNote(editing._id, {
          ...toUpdateBody(editing),
          ...body,
        });
      } else {
        await createNote(body);
      }
      onSaved();
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
    if (!window.confirm(`Delete “${editing.title}”?`)) return;

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
    folderId,
    setFolderId,
    labelIds,
    setLabelIds,
    goalId,
    setGoalId,
    sprintId,
    setSprintId,
    date,
    setDate,
    pinned,
    setPinned,
    archived,
    setArchived,
    goals,
    sprints,
    goalsLoading: goalsQuery.isLoading,
    sprintsLoading: sprintsQuery.isLoading,
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
