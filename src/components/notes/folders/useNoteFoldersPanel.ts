"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useNoteFoldersApi } from "@/shared/hooks";
import type { NoteFolder, RecordId } from "@/shared/types";

type Editor =
  | { type: "idle" }
  | { type: "create" }
  | { type: "rename"; folder: NoteFolder };

interface Options {
  onOpen?: (id: RecordId) => void;
  onDeleted?: (id: RecordId) => void;
}

export function useNoteFoldersPanel({ onOpen, onDeleted }: Options = {}) {
  const {
    createNoteFolder,
    updateNoteFolder,
    deleteNoteFolder,
    isCreating,
    isUpdating,
    isDeleting,
  } = useNoteFoldersApi();

  const [editor, setEditor] = useState<Editor>({ type: "idle" });
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;
  const creating = editor.type === "create";
  const renaming = editor.type === "rename" ? editor.folder : null;

  const startCreate = () => {
    setEditor({ type: "create" });
    setName("");
    setError("");
  };

  const startRename = (folder: NoteFolder) => {
    setEditor({ type: "rename", folder });
    setName(folder.name);
    setError("");
  };

  const cancelEditor = () => {
    setEditor({ type: "idle" });
    setName("");
    setError("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setError("");
    try {
      if (editor.type === "rename") {
        await updateNoteFolder(editor.folder._id, { name: trimmed });
        cancelEditor();
        return;
      }

      const folder = await createNoteFolder({ name: trimmed });
      cancelEditor();
      onOpen?.(folder._id);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editor.type === "rename"
            ? "Could not rename folder."
            : "Could not create folder.",
        ),
      );
    }
  };

  const onDelete = async (folder: NoteFolder) => {
    setError("");
    try {
      await deleteNoteFolder(folder._id);
      if (editor.type === "rename" && editor.folder._id === folder._id) {
        cancelEditor();
      }
      onDeleted?.(folder._id);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete folder."));
    }
  };

  const isRenaming = (id: RecordId) => renaming?._id === id;

  return {
    creating,
    renaming,
    name,
    setName,
    error,
    pending,
    startCreate,
    startRename,
    cancelEditor,
    onSubmit,
    onDelete,
    isRenaming,
  };
}

export type NoteFoldersPanelModel = ReturnType<typeof useNoteFoldersPanel>;
