"use client";

import { FC, useId } from "react";
import {
  Button,
  DatePicker,
  Field,
  Input,
  MarkdownEditor,
  Select,
  cn,
} from "@/components/common";
import { LabelField, LabelManagerModal } from "@/components/labels";
import type { Label, NoteFolder } from "@/shared/types";
import { useNoteForm, type NoteFormMode } from "./useNoteForm";

export type { NoteFormMode };

interface Props {
  mode: NoteFormMode;
  folders: NoteFolder[];
  labels: Label[];
  onClose: () => void;
  onSaved: (result?: { deleted?: boolean }) => void;
}

const Toggle: FC<{
  pressed: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: string;
}> = ({ pressed, onClick, disabled, children }) => (
  <button
    type="button"
    aria-pressed={pressed}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "cursor-pointer rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
      pressed
        ? "border-foreground bg-foreground text-background"
        : "border-border text-muted hover:text-foreground",
    )}
  >
    {children}
  </button>
);

const NoteForm: FC<Props> = ({ mode, folders, labels, onClose, onSaved }) => {
  const titleId = useId();
  const form = useNoteForm(mode, onSaved);

  return (
    <>
      <form onSubmit={form.onSubmit} className="flex w-full flex-col gap-3">
        <p className="text-sm text-muted">
          {form.editing
            ? "Update this note and where it belongs."
            : "Capture something outside the task board."}
        </p>

        <Field label="Title" htmlFor={titleId}>
          <Input
            id={titleId}
            value={form.title}
            onChange={(event) => form.setTitle(event.target.value)}
            required
            maxLength={200}
            autoFocus
            placeholder="Note title"
          />
        </Field>

        <Field label="Content">
          <MarkdownEditor
            value={form.content}
            onChange={form.setContent}
            rows={8}
            placeholder="Write markdown…"
          />
        </Field>

        <LabelField
          labels={labels}
          selectedIds={form.labelIds}
          onChange={form.setLabelIds}
          onCreate={form.openLabelCreate}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Folder">
            <Select
              value={form.folderId}
              onChange={(event) => form.setFolderId(event.target.value)}
              aria-label="Folder"
            >
              <option value="">Unfiled</option>
              {form.folderId &&
                !folders.some((folder) => folder._id === form.folderId) && (
                  <option value={form.folderId}>Unknown folder</option>
                )}
              {folders.map((folder) => (
                <option key={folder._id} value={folder._id}>
                  {folder.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Date">
            <DatePicker
              value={form.date}
              onChange={form.setDate}
              clearable
              aria-label="Note date"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Goal">
            <Select
              value={form.goalId}
              onChange={(event) => form.setGoalId(event.target.value)}
              disabled={form.pending || form.goalsLoading}
              aria-label="Linked goal"
            >
              <option value="">No goal</option>
              {form.goalId &&
                !form.goals.some((goal) => goal._id === form.goalId) && (
                  <option value={form.goalId}>Unknown goal</option>
                )}
              {form.goals.map((goal) => (
                <option key={goal._id} value={goal._id}>
                  {goal.title}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Sprint">
            <Select
              value={form.sprintId}
              onChange={(event) => form.setSprintId(event.target.value)}
              disabled={form.pending || form.sprintsLoading}
              aria-label="Linked sprint"
            >
              <option value="">No sprint</option>
              {form.sprintId &&
                !form.sprints.some((sprint) => sprint._id === form.sprintId) && (
                  <option value={form.sprintId}>Unknown sprint</option>
                )}
              {form.sprints.map((sprint) => (
                <option key={sprint._id} value={sprint._id}>
                  {sprint.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Toggle
            pressed={form.pinned}
            onClick={() => form.setPinned(!form.pinned)}
            disabled={form.pending}
          >
            Pinned
          </Toggle>
          {form.editing && (
            <Toggle
              pressed={form.archived}
              onClick={() => form.setArchived(!form.archived)}
              disabled={form.pending}
            >
              Archived
            </Toggle>
          )}
        </div>

        {form.error && <p className="text-sm text-rose-500">{form.error}</p>}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {form.editing && (
            <Button
              variant="ghost"
              className="mr-auto hover:text-rose-500"
              onClick={form.onDelete}
              disabled={form.pending}
            >
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={form.pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.pending}>
            {form.pending
              ? "Saving…"
              : form.editing
                ? "Save changes"
                : "Create note"}
          </Button>
        </div>
      </form>

      <LabelManagerModal
        open={form.labelManagerOpen}
        labels={labels}
        initialName={form.labelDraftName}
        onClose={form.closeLabelManager}
        onCreated={(label) => form.onLabelCreated(label._id)}
        onDeleted={form.onLabelDeleted}
      />
    </>
  );
};

export default NoteForm;

export const noteFormTitle = (mode: NoteFormMode): string => {
  return mode.type === "edit" ? "Edit note" : "New note";
}
