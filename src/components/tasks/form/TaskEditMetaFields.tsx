"use client";

import { FC } from "react";
import { DatePicker, Field, Select } from "@/components/common";
import type {
  Project,
  RecordId,
  Sprint,
  TaskPriority,
  TaskStatus,
  TaskStoryPoints,
} from "@/shared/types";
import {
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STORY_POINTS_OPTIONS,
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
  projectId: RecordId | "";
  onProjectIdChange: (value: RecordId | "") => void;
  projects: Project[];
  showProjectSelector: boolean;
  storyPoints: TaskStoryPoints | "";
  onStoryPointsChange: (value: TaskStoryPoints | "") => void;
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
  projectId,
  onProjectIdChange,
  projects,
  showProjectSelector,
  storyPoints,
  onStoryPointsChange,
}) => {
  const projectRecordId = (projectId as unknown as Project)?._id || projectId;
  return (
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

        <div>
          <span className="mb-1.5 block text-sm text-muted">Story points</span>
          <Select
            value={storyPoints}
            onChange={(event) =>
              onStoryPointsChange(
                event.target.value
                  ? (Number(event.target.value) as TaskStoryPoints)
                  : "",
              )
            }
            className="w-full"
            aria-label="Story points"
          >
            <option value="">None</option>
            {STORY_POINTS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Doing date">
          <DatePicker
            value={doingDate}
            onChange={onDoingDateChange}
            aria-label="Doing date"
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

      {showProjectSelector && (
        <div>
          <span className="mb-1.5 block text-sm text-muted">Project</span>
          <Select
            value={projectRecordId}
            onChange={(event) => onProjectIdChange(event.target.value)}
            className="w-full"
            aria-label="Project"
          >
            <option value="">None</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>
      )}
    </>
  );
};

export default TaskEditMetaFields;
