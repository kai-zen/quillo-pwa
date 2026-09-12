"use client";

import { useId, useState } from "react";
import {
  Button,
  ConfirmModal,
  Field,
  Input,
  MarkdownEditor,
  Select,
} from "@/components/common";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_OPTIONS,
  toColorInputValue,
} from "../helpers";
import { type ProjectFormMode, useProjectForm } from "./useProjectForm";

export type { ProjectFormMode };

interface Props {
  mode: ProjectFormMode;
  onClose: () => void;
  onSaved: (result?: { deleted?: boolean }) => void;
}

export default function ProjectForm({ mode, onClose, onSaved }: Props) {
  const nameId = useId();
  const colorId = useId();
  const form = useProjectForm(mode, onSaved);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <form onSubmit={form.onSubmit} className="flex w-full flex-col gap-3">
        <p className="text-sm text-muted">
          {form.editing
            ? "Update this project."
            : "Create a project to group related tasks."}
        </p>
        <Field label="Name" htmlFor={nameId}>
          <Input
            id={nameId}
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
            required
            maxLength={200}
            autoFocus
            placeholder="Project name"
          />
        </Field>
        <Field label="Description">
          <MarkdownEditor
            value={form.description}
            onChange={form.setDescription}
            rows={5}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Color" htmlFor={colorId}>
            <div className="flex items-center gap-2">
              <input
                id={colorId}
                type="color"
                value={toColorInputValue(form.color)}
                onChange={(event) => form.setColor(event.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-surface p-1"
              />
              <Input
                value={form.color}
                onChange={(event) => form.setColor(event.target.value)}
                aria-label="Project color hex value"
                placeholder="#3b82f6"
              />
            </div>
          </Field>
          {form.editing && (
            <Field label="Status">
              <Select
                value={form.status}
                onChange={(event) =>
                  form.setStatus(event.target.value as typeof form.status)
                }
                aria-label="Project status"
              >
                {PROJECT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {PROJECT_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
        {form.error && <p className="text-sm text-rose-500">{form.error}</p>}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {form.editing && (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto hover:text-rose-500"
              onClick={() => setConfirmDelete(true)}
              disabled={form.pending}
            >
              Delete
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} disabled={form.pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.pending}>
            {form.pending
              ? "Saving…"
              : form.editing
                ? "Save changes"
                : "Create project"}
          </Button>
        </div>
      </form>
      <ConfirmModal
        open={confirmDelete}
        title="Delete project"
        description={
          form.editing
            ? `Delete “${form.editing.name}”? Its tasks will remain, but they will no longer belong to a project.`
            : undefined
        }
        confirmLabel="Delete"
        pending={form.pending}
        pendingLabel="Deleting…"
        onClose={() => setConfirmDelete(false)}
        onConfirm={form.onDelete}
      />
    </>
  );
}

export const projectFormTitle = (mode: ProjectFormMode): string =>
  mode.type === "edit" ? "Edit project" : "New project";
