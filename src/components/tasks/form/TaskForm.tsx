"use client";

import { Plus, Repeat, Trash2 } from "lucide-react";
import { FC, useId } from "react";
import { Button, ConfirmModal, Field, Input, MarkdownEditor } from "@/components/common";
import { LabelField, LabelManagerModal } from "@/components/labels";
import type { Label, Sprint } from "@/shared/types";
import TaskMetaFields from "./TaskMetaFields";
import { useTaskForm, type TaskFormMode } from "./useTaskForm";

export type { TaskFormMode };

interface Props {
  mode: TaskFormMode;
  labels: Label[];
  sprints: Sprint[];
  onClose: () => void;
  onSaved: () => void;
  onCreateSubtask?: () => void;
  onAddFromRoutines?: () => void;
}

const TaskForm: FC<Props> = ({
  mode,
  labels,
  sprints,
  onClose,
  onSaved,
  onCreateSubtask,
  onAddFromRoutines,
}) => {
  const titleId = useId();
  const form = useTaskForm(mode, onSaved);
  const canCreateSubtask =
    !!form.editing && !form.editing.parent_id && !!onCreateSubtask;
  const canAddFromRoutines =
    !!onAddFromRoutines && !form.editing && !form.isSubtaskCreate;

  return (
    <>
      <form onSubmit={form.onSubmit} className="flex flex-col gap-3 w-full">
        <p className="text-sm text-muted">
          {form.editing
            ? "Update the task details."
            : form.isSubtaskCreate
              ? form.parentTitle
                ? `Nested under “${form.parentTitle}”.`
                : "A shorter form for a nested task."
              : "Add something to your backlog."}
        </p>

        <Field label="Title" htmlFor={titleId}>
          <Input
            id={titleId}
            value={form.title}
            onChange={(event) => form.setTitle(event.target.value)}
            required
            maxLength={200}
            autoFocus
            placeholder="What needs doing?"
          />
        </Field>

        <Field label="Description">
          <MarkdownEditor
            value={form.description}
            onChange={form.setDescription}
            rows={form.isSubtaskCreate ? 3 : 6}
            compact={form.isSubtaskCreate}
            placeholder="Notes, checklists, links…"
          />
        </Field>

        <LabelField
          labels={labels}
          selectedIds={form.labelIds}
          onChange={form.setLabelIds}
          onCreate={form.openLabelCreate}
        />

        <TaskMetaFields
          editing={!!form.editing}
          isSubtaskCreate={form.isSubtaskCreate}
          priority={form.priority}
          onPriorityChange={form.setPriority}
          status={form.status}
          onStatusChange={form.setStatus}
          doingDate={form.doingDate}
          onDoingDateChange={form.setDoingDate}
          sprintId={form.sprintId}
          onSprintIdChange={form.setSprintId}
          sprints={sprints}
        />

        {form.error && <p className="text-sm text-foreground">{form.error}</p>}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {form.editing && (
            <Button
              type="button"
              variant="secondary"
              className="mr-auto text-destructive hover:text-destructive"
              onClick={() => form.setDeleteConfirmOpen(true)}
              disabled={form.pending}
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          )}
          {canAddFromRoutines && (
            <Button
              variant="secondary"
              className={form.editing ? "" : "mr-auto"}
              onClick={onAddFromRoutines}
            >
              <Repeat className="h-4 w-4" aria-hidden />
              Add from routines
            </Button>
          )}
          {canCreateSubtask && (
            <Button
              variant="secondary"
              className={form.editing ? "" : "mr-auto"}
              onClick={onCreateSubtask}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Create subtask
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.pending}>
            {form.pending
              ? "Saving…"
              : form.editing
                ? "Save changes"
                : form.isSubtaskCreate
                  ? "Create subtask"
                  : "Create task"}
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

      <ConfirmModal
        open={form.deleteConfirmOpen}
        title="Delete task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        pending={form.pending}
        pendingLabel="Deleting…"
        onClose={() => form.setDeleteConfirmOpen(false)}
        onConfirm={form.onDelete}
      />
    </>
  );
};

export default TaskForm;

export function taskFormTitle(mode: TaskFormMode): string {
  if (mode.type === "edit") return "Edit task";
  if (mode.parentId) return "New subtask";
  return "New task";
}
