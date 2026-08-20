"use client";

import { Plus } from "lucide-react";
import { FC, FormEvent, useId, useState } from "react";
import {
  Button,
  Field,
  Input,
  MarkdownEditor,
  Select,
} from "@/components/common";
import { LabelField, LabelManagerModal } from "@/components/labels";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
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
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  toDateInputValue,
  toUpdateBody,
} from "./helpers";

export type TaskFormMode =
  | { type: "create"; parentId?: RecordId | null; parentTitle?: string }
  | { type: "edit"; task: Task };

interface Props {
  mode: TaskFormMode;
  labels: Label[];
  sprints: Sprint[];
  onClose: () => void;
  onSaved: () => void;
  onCreateSubtask?: () => void;
}

const TaskForm: FC<Props> = ({
  mode,
  labels,
  sprints,
  onClose,
  onSaved,
  onCreateSubtask,
}) => {
  const { createTask, updateTask, isCreating, isUpdating } = useTasksApi();
  const titleId = useId();

  const editing = mode.type === "edit" ? mode.task : null;
  const isSubtaskCreate = mode.type === "create" && !!mode.parentId;
  const parentTitle =
    mode.type === "create" ? (mode.parentTitle ?? "") : "";
  const canCreateSubtask =
    !!editing && !editing.parent_id && !!onCreateSubtask;

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
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [labelDraftName, setLabelDraftName] = useState("");
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating;

  const openLabelCreate = (draftName: string) => {
    setLabelDraftName(draftName);
    setLabelManagerOpen(true);
  };

  const buildBody = (): CreateTaskBody | UpdateTaskBody => {
    if (mode.type === "create") {
      return {
        title: title.trim(),
        description: description.trim(),
        label_ids: labelIds,
        status: "todo",
        sprint_id: null,
        parent_id: mode.parentId ?? null,
        ...(isSubtaskCreate
          ? {}
          : {
              priority,
              doing_date: doingDate || null,
            }),
      };
    }

    return {
      title: title.trim(),
      priority,
      status,
      description: description.trim(),
      label_ids: labelIds,
      sprint_id: sprintId || null,
      doing_date: doingDate || null,
      parent_id: editing?.parent_id ?? null,
    };
  };

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
          editing
            ? "Could not update task."
            : isSubtaskCreate
              ? "Could not create subtask."
              : "Could not create task.",
        ),
      );
    }
  };

  return (
    <>
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
                ? "Update the task details."
                : isSubtaskCreate
                  ? parentTitle
                    ? `Nested under “${parentTitle}”.`
                    : "A shorter form for a nested task."
                  : "Add something to your backlog."}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Title" htmlFor={titleId}>
            <Input
              id={titleId}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={200}
              autoFocus
              placeholder="What needs doing?"
            />
          </Field>

          <Field label="Description">
            <MarkdownEditor
              value={description}
              onChange={setDescription}
              rows={isSubtaskCreate ? 3 : 6}
              compact={isSubtaskCreate}
              placeholder="Notes, checklists, links…"
            />
          </Field>

          <LabelField
            labels={labels}
            selectedIds={labelIds}
            onChange={setLabelIds}
            onCreate={openLabelCreate}
          />

          {editing && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="mb-1.5 block text-sm text-muted">Status</span>
                  <Select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as TaskStatus)
                    }
                    className="w-full"
                    aria-label="Status"
                  >
                    {STATUS_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <span className="mb-1.5 block text-sm text-muted">
                    Priority
                  </span>
                  <Select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as TaskPriority)
                    }
                    className="w-full"
                    aria-label="Priority"
                  >
                    {PRIORITY_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {PRIORITY_LABELS[value]}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Doing date">
                  <Input
                    type="date"
                    value={doingDate}
                    onChange={(event) => setDoingDate(event.target.value)}
                  />
                </Field>

                <div>
                  <span className="mb-1.5 block text-sm text-muted">Sprint</span>
                  <Select
                    value={sprintId}
                    onChange={(event) => setSprintId(event.target.value)}
                    className="w-full"
                    aria-label="Sprint"
                  >
                    <option value="">None</option>
                    {sprints.map((sprint) => (
                      <option key={sprint._id} value={sprint._id}>
                        {sprint.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </>
          )}

          {mode.type === "create" && !isSubtaskCreate && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-sm text-muted">Priority</span>
                <Select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as TaskPriority)
                  }
                  className="w-full"
                  aria-label="Priority"
                >
                  {PRIORITY_OPTIONS.map((value) => (
                    <option key={value} value={value}>
                      {PRIORITY_LABELS[value]}
                    </option>
                  ))}
                </Select>
              </div>

              <Field label="Doing date">
                <Input
                  type="date"
                  value={doingDate}
                  onChange={(event) => setDoingDate(event.target.value)}
                />
              </Field>
            </div>
          )}

          {error && <p className="text-sm text-foreground">{error}</p>}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            {canCreateSubtask && (
              <Button
                variant="secondary"
                className="mr-auto"
                onClick={onCreateSubtask}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Create subtask
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : isSubtaskCreate
                    ? "Create subtask"
                    : "Create task"}
            </Button>
          </div>
        </div>
      </form>

      <LabelManagerModal
        open={labelManagerOpen}
        labels={labels}
        initialName={labelDraftName}
        onClose={() => setLabelManagerOpen(false)}
        onCreated={(label) => {
          setLabelIds((current) =>
            current.includes(label._id) ? current : [...current, label._id],
          );
        }}
        onDeleted={(id) => {
          setLabelIds((current) => current.filter((item) => item !== id));
        }}
      />
    </>
  );
};

export default TaskForm;
