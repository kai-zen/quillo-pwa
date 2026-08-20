"use client";

import { FC } from "react";
import { Field, Input, Select } from "@/components/common";
import type { RecordId, Sprint, TaskPriority, TaskStatus } from "@/shared/types";
import {
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from "../helpers";

interface Props {
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

const TaskEditMetaFields: FC<Props> = ({
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  doingDate,
  onDoingDateChange,
  sprintId,
  onSprintIdChange,
  sprints,
}) => (
  <>
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <span className="mb-1.5 block text-sm text-muted">Status</span>
        <Select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as TaskStatus)
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
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Doing date">
        <Input
          type="date"
          value={doingDate}
          onChange={(event) => onDoingDateChange(event.target.value)}
        />
      </Field>

      <div>
        <span className="mb-1.5 block text-sm text-muted">Sprint</span>
        <Select
          value={sprintId}
          onChange={(event) => onSprintIdChange(event.target.value)}
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
);

export default TaskEditMetaFields;
