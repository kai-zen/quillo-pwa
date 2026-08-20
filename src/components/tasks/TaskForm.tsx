"use client";

import { FC, FormEvent, useState } from "react";
import {
  Button,
  Field,
  Input,
  MarkdownEditor,
  Select,
} from "@/components/common";
import { getErrorMessage } from "@/shared/errors";
import { useLabelsApi, useTasksApi } from "@/shared/hooks";
import type {
  CreateTaskBody,
  Label,
  RecordId,
  Sprint,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskBody,
} from "@/shared/types";
import {
  LABEL_COLORS,
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  toDateInputValue,
  toUpdateBody,
} from "./helpers";

export type TaskFormMode =
  | { type: "create"; parentId?: RecordId | null }
  | { type: "edit"; task: Task };

interface Props {
  mode: TaskFormMode;
  labels: Label[];
  sprints: Sprint[];
  tasks: Task[];
  parentIdsWithChildren: Set<RecordId>;
  onClose: () => void;
  onSaved: () => void;
}

const TaskForm: FC<Props> = ({
  mode,
  labels,
  sprints,
  tasks,
  parentIdsWithChildren,
  onClose,
  onSaved,
}) => {
  const { createTask, updateTask, isCreating, isUpdating } = useTasksApi();
  const { createLabel, isCreating: isCreatingLabel } = useLabelsApi();

  const editing = mode.type === "edit" ? mode.task : null;
  const defaultParentId =
    mode.type === "create" ? (mode.parentId ?? null) : editing?.parent_id;

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    editing?.priority ?? "unset",
  );
  const [status, setStatus] = useState<TaskStatus>(editing?.status ?? "todo");
  const [labelIds, setLabelIds] = useState<RecordId[]>(
    editing?.label_ids ?? [],
  );
  const [sprintId, setSprintId] = useState<RecordId | "">(
    editing?.sprint_id ?? "",
  );
  const [doingDate, setDoingDate] = useState(
    toDateInputValue(editing?.doing_date ?? null),
  );
  const [parentId, setParentId] = useState<RecordId | "">(
    defaultParentId ?? "",
  );
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState<string>(LABEL_COLORS[0]);
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isCreatingLabel;
  const isSubtaskCreate = mode.type === "create" && !!mode.parentId;
  const editingHasChildren =
    !!editing && parentIdsWithChildren.has(editing._id);

  const toggleLabel = (id: RecordId) => {
    setLabelIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const onCreateLabel = async () => {
    const name = newLabelName.trim();
    if (!name) return;

    setError("");
    try {
      const label = await createLabel({ name, color: newLabelColor });
      setLabelIds((current) =>
        current.includes(label._id) ? current : [...current, label._id],
      );
      setNewLabelName("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not create label."));
    }
  };

  const buildBody = (): CreateTaskBody | UpdateTaskBody => ({
    title: title.trim(),
    priority,
    status,
    description: description.trim(),
    label_ids: labelIds,
    sprint_id: sprintId || null,
    doing_date: doingDate || null,
    parent_id: editingHasChildren ? null : parentId || null,
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
        await updateTask(editing._id, {
          ...toUpdateBody(editing),
          ...body,
        });
      } else {
        await createTask(body);
      }
      onSaved();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing ? "Could not update task." : "Could not create task.",
        ),
      );
    }
  };

  const eligibleParents = tasks.filter((task) => {
    if (task.parent_id) return false;
    if (editing && task._id === editing._id) return false;
    return true;
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-border bg-surface p-4"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {editing
              ? "Edit task"
              : isSubtaskCreate
                ? "New subtask"
                : "New task"}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {editing
              ? "Update the full task details."
              : "Add something to your backlog."}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <Field label="Title">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            placeholder="What needs doing?"
          />
        </Field>

        <Field label="Description">
          <MarkdownEditor
            value={description}
            onChange={setDescription}
            rows={6}
            placeholder={"Notes, checklists, links…\n\n**bold**, _italic_, `code`"}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Status">
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              className="w-full"
            >
              {STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Priority">
            <Select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
              className="w-full"
            >
              {PRIORITY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Doing date">
            <Input
              type="date"
              value={doingDate}
              onChange={(event) => setDoingDate(event.target.value)}
            />
          </Field>

          <Field label="Sprint">
            <Select
              value={sprintId}
              onChange={(event) => setSprintId(event.target.value)}
              className="w-full"
            >
              <option value="">None</option>
              {sprints.map((sprint) => (
                <option key={sprint._id} value={sprint._id}>
                  {sprint.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {!isSubtaskCreate && !editingHasChildren && (
          <Field label="Parent task">
            <Select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="w-full"
            >
              <option value="">None (top-level)</option>
              {eligibleParents.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <fieldset>
          <legend className="mb-1.5 block text-sm text-muted">Labels</legend>
          {labels.length === 0 ? (
            <p className="text-sm text-muted">No labels yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const selected = labelIds.includes(label._id);
                return (
                  <button
                    key={label._id}
                    type="button"
                    onClick={() => toggleLabel(label._id)}
                    className={[
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors",
                      selected
                        ? "border-foreground bg-accent-soft text-foreground"
                        : "border-border text-muted hover:border-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: label.color }}
                      aria-hidden
                    />
                    {label.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <Field label="New label" className="min-w-0 flex-1">
              <Input
                value={newLabelName}
                onChange={(event) => setNewLabelName(event.target.value)}
                placeholder="Name"
                maxLength={50}
              />
            </Field>
            <div className="flex flex-wrap gap-1.5 pb-0.5">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewLabelColor(color)}
                  className={[
                    "h-7 w-7 cursor-pointer rounded-md border transition-opacity",
                    newLabelColor === color
                      ? "border-foreground opacity-100"
                      : "border-transparent opacity-70 hover:opacity-100",
                  ].join(" ")}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
            <Button
              variant="secondary"
              onClick={onCreateLabel}
              disabled={pending || !newLabelName.trim()}
            >
              Add label
            </Button>
          </div>
        </fieldset>

        {error && <p className="text-sm text-foreground">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : editing ? "Save changes" : "Create task"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
