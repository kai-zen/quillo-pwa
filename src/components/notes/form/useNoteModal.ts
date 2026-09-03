"use client";

import { useState } from "react";
import type { Note } from "@/shared/types";
import type {
  NoteFormMode,
  NoteModalMode,
  NoteSaveResult,
} from "./useNoteForm";

export function useNoteModal(
  mode: NoteModalMode | null,
  onClose: () => void,
  onSaved: (result?: NoteSaveResult) => void,
) {
  const modeKey =
    mode?.type === "view" ? `view:${mode.note._id}` : (mode?.type ?? "closed");
  const [sessionKey, setSessionKey] = useState(modeKey);
  const [editing, setEditing] = useState(false);
  const [savedNote, setSavedNote] = useState<Note | null>(null);

  if (sessionKey !== modeKey) {
    setSessionKey(modeKey);
    setEditing(false);
    setSavedNote(null);
  }

  const sessionMatches = sessionKey === modeKey;
  const viewNote = mode?.type === "view" ? mode.note : null;
  const note = (sessionMatches ? savedNote : null) ?? viewNote;
  const isEditing = sessionMatches && editing;
  const reading = mode?.type === "view" && !!note && !isEditing;
  const formMode: NoteFormMode | null =
    mode?.type === "create"
      ? mode
      : isEditing && note
        ? { type: "edit", note }
        : null;

  const title =
    mode?.type === "create"
      ? "New note"
      : isEditing
        ? "Edit note"
        : (note?.title ?? "");

  const startEdit = () => setEditing(true);

  const onFormClose = () => {
    if (mode?.type === "create") onClose();
    else setEditing(false);
  };

  const onFormSaved = (result?: NoteSaveResult) => {
    if (result?.deleted || mode?.type === "create") {
      onSaved(result);
      return;
    }
    if (result?.note) setSavedNote(result.note);
    setEditing(false);
  };

  return {
    note,
    reading,
    formMode,
    title,
    startEdit,
    onFormClose,
    onFormSaved,
  };
}
