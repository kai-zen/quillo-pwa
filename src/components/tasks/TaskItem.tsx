"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { FC, useState } from "react";
import { IconButton, Select } from "@/components/common";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
import type { Label, Sprint, Task, TaskStatus } from "@/shared/types";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  toUpdateBody,
} from "./helpers";

interface Props {
  task: Task;
  depth?: number;
  labelsById: Map<string, Label>;
  sprintsById: Map<string, Sprint>;
  onEdit: (task: Task) => void;
  onAddSubtask: (parent: Task) => void;
}

const TaskItem: FC<Props> = ({
  task,
  depth = 0,
  labelsById,
  sprintsById,
  onEdit,
  onAddSubtask,
}) => {
  const { updateTask, deleteTask, isUpdating, isDeleting } = useTasksApi();
  const [error, setError] = useState("");
  const pending = isUpdating || isDeleting;

  const sprint = task.sprint_id ? sprintsById.get(task.sprint_id) : null;
  const taskLabels = task.label_ids
    .map((id) => labelsById.get(id))
    .filter((label): label is Label => !!label);

  const onStatusChange = async (status: TaskStatus) => {
    setError("");
    try {
      await updateTask(task._id, { ...toUpdateBody(task), status });
    } catch (err) {
      setError(getErrorMessage(err, "Could not update status."));
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setError("");
    try {
      await deleteTask(task._id);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete task."));
    }
  };

  return (
    <li
      className={[
        "border-b border-border py-3 last:border-b-0",
        depth > 0 ? "ml-5 border-l border-border pl-3" : "",
      ].join(" ")}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {task.title}
            </p>
            {task.priority !== "unset" && (
              <span className="text-xs text-muted">
                {PRIORITY_LABELS[task.priority]}
              </span>
            )}
          </div>

          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {taskLabels.map((label) => (
              <span
                key={label._id}
                className="inline-flex items-center gap-1.5 text-xs text-muted"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: label.color }}
                  aria-hidden
                />
                {label.name}
              </span>
            ))}
            {sprint && (
              <span className="text-xs text-muted">Sprint: {sprint.name}</span>
            )}
            {task.doing_date && (
              <span className="text-xs text-muted">
                Doing {task.doing_date.slice(0, 10)}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Select
            value={task.status}
            onChange={(event) =>
              onStatusChange(event.target.value as TaskStatus)
            }
            disabled={pending}
            aria-label="Task status"
            sizeVariant="sm"
          >
            {STATUS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </Select>

          {!task.parent_id && (
            <IconButton
              label="Add subtask"
              size="sm"
              onClick={() => onAddSubtask(task)}
              disabled={pending}
            >
              <Plus className="h-4 w-4" aria-hidden />
            </IconButton>
          )}

          <IconButton
            label="Edit task"
            size="sm"
            onClick={() => onEdit(task)}
            disabled={pending}
          >
            <Pencil className="h-4 w-4" aria-hidden />
          </IconButton>

          <IconButton
            label="Delete task"
            size="sm"
            onClick={onDelete}
            disabled={pending}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-foreground">{error}</p>}
    </li>
  );
};

export default TaskItem;
