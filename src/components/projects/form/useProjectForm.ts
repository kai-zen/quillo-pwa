"use client";

import { useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useProjectsApi } from "@/shared/hooks";
import type {
  CreateProjectBody,
  Project,
  ProjectStatus,
} from "@/shared/types";
import { isValidProjectColor, toUpdateBody } from "../helpers";

export type ProjectFormMode =
  | { type: "create" }
  | { type: "edit"; project: Project };

export function useProjectForm(
  mode: ProjectFormMode,
  onSaved: (result?: { deleted?: boolean }) => void,
) {
  const api = useProjectsApi();
  const editing = mode.type === "edit" ? mode.project : null;
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [color, setColor] = useState(editing?.color ?? "#3b82f6");
  const [status, setStatus] = useState<ProjectStatus>(
    editing?.status ?? "active",
  );
  const [error, setError] = useState("");
  const pending = api.isCreating || api.isUpdating || api.isDeleting;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName) return setError("Name is required.");
    if (!isValidProjectColor(color))
      return setError("Color must be a valid hex value.");

    const body: CreateProjectBody = {
      name: trimmedName,
      description: description.trim(),
      color,
      status,
    };
    try {
      if (editing) {
        await api.updateProject(editing._id, {
          ...toUpdateBody(editing),
          ...body,
        });
      } else {
        await api.createProject(body);
      }
      onSaved();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing ? "Could not update project." : "Could not create project.",
        ),
      );
    }
  };

  const onDelete = async () => {
    if (!editing) return;
    setError("");
    try {
      await api.deleteProject(editing._id);
      onSaved({ deleted: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete project."));
    }
  };

  return {
    editing,
    name,
    setName,
    description,
    setDescription,
    color,
    setColor,
    status,
    setStatus,
    error,
    pending,
    onSubmit,
    onDelete,
  };
}
