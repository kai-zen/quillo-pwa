"use client";

import { FC } from "react";
import { DatePicker, Field, Select } from "@/components/common";
import type { RecordId, Sprint, TaskPriority, TaskStatus } from "@/shared/types";
import {
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
} from "../helpers";
import TaskEditMetaFields from "./TaskEditMetaFields";

interface Props {
  editing: boolean;
  isSubtaskCreate: boolean;
  priority: TaskPriority;
  onPriorityChange: (value: TaskPriority) => void;
  status: TaskStatus;
  onStatusChange: (value: TaskStatus) => void;
  doingDate: string;
  onDoingDateChange: (value: string) => void;
  sprintId: RecordId | "";
  onSprintIdChange: (value: RecordId | "") => void;
  sprints: Sprint[];
}

const TaskMetaFields: FC<Props> = ({
  editing,
  isSubtaskCreate,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  doingDate,
  onDoingDateChange,
  sprintId,
  onSprintIdChange,
  sprints,
}) => {
  if (editing) {
    return (
      <TaskEditMetaFields
        priority={priority}
        onPriorityChange={onPriorityChange}
        status={status}
        onStatusChange={onStatusChange}
        doingDate={doingDate}
        onDoingDateChange={onDoingDateChange}
        sprintId={sprintId}
        onSprintIdChange={onSprintIdChange}
        sprints={sprints}
      />
    );
  }

  if (isSubtaskCreate) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <span className="mb-1.5 block text-sm text-muted">Priority</span>
        <Select
          value={priority}
          onChange={(event) =>
            onPriorityChange(event.target.value as TaskPriority)
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
        <DatePicker
          value={doingDate}
          onChange={onDoingDateChange}
          aria-label="Doing date"
        />
      </Field>
    </div>
  );
};

export default TaskMetaFields;
