"use client";

import { FC, useState } from "react";
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

const fieldClass =
  "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground";
const labelClass = "mb-1.5 block text-sm text-muted";

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

  const buildBody = (): CreateTaskBody | UpdateTaskBody => {
    const body: CreateTaskBody = {
      title: title.trim(),
      priority,
      status,
      description: description.trim(),
      label_ids: labelIds,
      sprint_id: sprintId || null,
      doing_date: doingDate || null,
      parent_id: editingHasChildren ? null : parentId || null,
    };
    return body;
  };

  const onSubmit = async (event: SubmitEvent) => {
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
      onSubmit={(event) => onSubmit(event as unknown as SubmitEvent)}
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
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer text-sm text-muted transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <label className="block">
          <span className={labelClass}>Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            className={fieldClass}
            placeholder="What needs doing?"
          />
        </label>

        <label className="block">
          <span className={labelClass}>Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={`${fieldClass} resize-y`}
            placeholder="Optional notes"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              className={fieldClass}
            >
              {STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>Priority</span>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as TaskPriority)
              }
              className={fieldClass}
            >
              {PRIORITY_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {PRIORITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Doing date</span>
            <input
              type="date"
              value={doingDate}
              onChange={(event) => setDoingDate(event.target.value)}
              className={fieldClass}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Sprint</span>
            <select
              value={sprintId}
              onChange={(event) => setSprintId(event.target.value)}
              className={fieldClass}
            >
              <option value="">None</option>
              {sprints.map((sprint) => (
                <option key={sprint._id} value={sprint._id}>
                  {sprint.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {!isSubtaskCreate && !editingHasChildren && (
          <label className="block">
            <span className={labelClass}>Parent task</span>
            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className={fieldClass}
            >
              <option value="">None (top-level)</option>
              {eligibleParents.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset>
          <legend className={labelClass}>Labels</legend>
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
            <label className="block min-w-0 flex-1">
              <span className={labelClass}>New label</span>
              <input
                value={newLabelName}
                onChange={(event) => setNewLabelName(event.target.value)}
                className={fieldClass}
                placeholder="Name"
                maxLength={50}
              />
            </label>
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
            <button
              type="button"
              onClick={onCreateLabel}
              disabled={pending || !newLabelName.trim()}
              className="cursor-pointer rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add label
            </button>
          </div>
        </fieldset>

        {error && <p className="text-sm text-foreground">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="cursor-pointer rounded-lg bg-foreground px-3 py-2 text-sm text-background transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Saving…" : editing ? "Save changes" : "Create task"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
