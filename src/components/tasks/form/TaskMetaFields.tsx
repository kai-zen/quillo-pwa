"use client";

import { FC, ReactNode } from "react";
import { DatePicker, Field, FieldLabel, Select } from "@/components/common";
import type {
  Project,
  RecordId,
  Sprint,
  TaskPriority,
  TaskStatus,
  TaskStoryPoints,
} from "@/shared/types";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
  STATUS_OPTIONS,
  STORY_POINTS_BADGE_CLASS,
  STORY_POINTS_OPTIONS,
} from "../helpers";
import ChoiceChips from "./ChoiceChips";

interface Props {
  editing: boolean;
  isSubtaskCreate: boolean;
  showProjectSelector: boolean;
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
  storyPoints: TaskStoryPoints | "";
  onStoryPointsChange: (value: TaskStoryPoints | "") => void;
}

const TaskMetaFields: FC<Props> = ({
  editing,
  isSubtaskCreate,
  showProjectSelector,
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
  storyPoints,
  onStoryPointsChange,
}) => {
  if (isSubtaskCreate) return null;

  const projectSelect = showProjectSelector ? (
    <Field label="Project" optional>
      <Select
        value={projectId}
        onChange={(event) => onProjectIdChange(event.target.value)}
        className="w-full"
        aria-label="Project"
      >
        <option value="">No project</option>
        {projects.map((project) => (
          <option key={project._id} value={project._id}>
            {project.name}
          </option>
        ))}
      </Select>
    </Field>
  ) : null;

  return (
    <div className="space-y-5">
      {editing && (
        <div>
          <FieldLabel>Status</FieldLabel>
          <ChoiceChips
            value={status}
            onChange={onStatusChange}
            aria-label="Status"
            options={STATUS_OPTIONS.map((value) => ({
              value,
              selectedClassName: STATUS_BADGE_CLASS[value],
              label: (
                <>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_CLASS[value]}`}
                    aria-hidden
                  />
                  {STATUS_LABELS[value]}
                </>
              ),
            }))}
          />
        </div>
      )}

      <div>
        <FieldLabel optional>Priority</FieldLabel>
        <ChoiceChips
          value={priority}
          onChange={onPriorityChange}
          aria-label="Priority"
          options={PRIORITY_OPTIONS.map((value) => ({
            value,
            selectedClassName: PRIORITY_BADGE_CLASS[value],
            label: PRIORITY_LABELS[value],
          }))}
        />
      </div>

      <div>
        <FieldLabel optional>Story points</FieldLabel>
        <ChoiceChips
          value={storyPoints}
          onChange={onStoryPointsChange}
          aria-label="Story points"
          options={[
            { value: "" as const, label: "None" },
            ...STORY_POINTS_OPTIONS.map((value) => ({
              value,
              selectedClassName: STORY_POINTS_BADGE_CLASS,
              className: "min-w-8 justify-center tabular-nums",
              label: value,
            })),
          ]}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Doing date" optional>
          <DatePicker
            value={doingDate}
            onChange={onDoingDateChange}
            placeholder="Not scheduled"
            aria-label="Doing date"
          />
        </Field>

        {editing ? (
          <Field label="Sprint" optional>
            <Select
              value={sprintId}
              onChange={(event) => onSprintIdChange(event.target.value)}
              className="w-full"
              aria-label="Sprint"
            >
              <option value="">No sprint</option>
              {sprints.map((sprint) => (
                <option key={sprint._id} value={sprint._id}>
                  {sprint.name}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          projectSelect
        )}

        {editing && projectSelect}
      </div>
    </div>
  );
};

export default TaskMetaFields;
