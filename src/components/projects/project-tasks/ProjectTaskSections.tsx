"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button, cn } from "@/components/common";
import DoneCheckbox from "@/components/tasks/task-day-cards/DoneCheckbox";
import {
  PRIORITY_BADGE_CLASS,
  PRIORITY_LABELS,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
  STORY_POINTS_BADGE_CLASS,
  formatStoryPoints,
  labelsById,
} from "@/components/tasks/helpers";
import type { Label, RecordId, Sprint, Task, TaskStatus } from "@/shared/types";
import { PROJECT_TASK_PAGE_LIMIT, formatTaskCount, pageRange } from "./helpers";
import type { ProjectStatusSlice } from "./useProjectTaskBrowser";

function SectionPager({
  slice,
  onPage,
}: {
  slice: ProjectStatusSlice;
  onPage: (status: TaskStatus, page: number) => void;
}) {
  if (slice.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPage(slice.status, Math.max(1, slice.page - 1))}
        disabled={slice.page <= 1 || slice.isFetching}
      >
        Previous
      </Button>
      <span className="text-xs tabular-nums text-muted">
        {pageRange(slice.page, PROJECT_TASK_PAGE_LIMIT, slice.total)}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() =>
          onPage(slice.status, Math.min(slice.totalPages, slice.page + 1))
        }
        disabled={slice.page >= slice.totalPages || slice.isFetching}
      >
        Next
      </Button>
    </div>
  );
}

function TaskMeta({
  task,
  labels,
  sprintName,
}: {
  task: Task;
  labels: Label[];
  sprintName: string | null;
}) {
  const storyPoints = formatStoryPoints(task.story_points);
  const visibleLabels = labels.slice(0, 2);
  const extraLabels = labels.length - visibleLabels.length;

  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
      {task.priority !== "unset" ? (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
            PRIORITY_BADGE_CLASS[task.priority],
          )}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
      ) : null}
      {storyPoints ? (
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
            STORY_POINTS_BADGE_CLASS,
          )}
        >
          {storyPoints} pt
        </span>
      ) : null}
      {visibleLabels.map((label) => (
        <span
          key={label._id}
          className="inline-flex items-center gap-1 text-[11px] text-muted"
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: label.color }}
            aria-hidden
          />
          {label.name}
        </span>
      ))}
      {extraLabels > 0 ? (
        <span className="text-[11px] text-muted">+{extraLabels}</span>
      ) : null}
      {sprintName ? (
        <span className="max-w-40 truncate text-[11px] text-muted">
          {sprintName}
        </span>
      ) : null}
    </span>
  );
}

function TaskRow({
  task,
  labels,
  sprintName,
  pendingId,
  nested,
  onEdit,
  onToggleDone,
}: {
  task: Task;
  labels: Label[];
  sprintName: string | null;
  pendingId: RecordId | null;
  nested?: boolean;
  onEdit: (task: Task) => void;
  onToggleDone: (task: Task) => void;
}) {
  const pending = pendingId === task._id;

  return (
    <div className={cn("flex items-start gap-2.5 px-3 py-2", nested && "pl-9")}>
      <DoneCheckbox task={task} pending={pending} onToggleDone={onToggleDone} />
      <button
        type="button"
        onClick={() => onEdit(task)}
        disabled={pending}
        className="min-w-0 flex-1 cursor-pointer text-left disabled:cursor-wait disabled:opacity-60"
      >
        <span className="flex items-baseline gap-2">
          <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-muted">
            #{task.task_number}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {task.title}
          </span>
          {nested ? (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                STATUS_BADGE_CLASS[task.status],
              )}
            >
              <span
                className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_CLASS[task.status])}
                aria-hidden
              />
              {STATUS_LABELS[task.status]}
            </span>
          ) : null}
        </span>
        <TaskMeta task={task} labels={labels} sprintName={sprintName} />
      </button>
    </div>
  );
}

export default function ProjectTaskSections({
  slices,
  labels,
  sprints,
  pendingId,
  onEdit,
  onToggleDone,
  onPage,
}: {
  slices: ProjectStatusSlice[];
  labels: Label[];
  sprints: Sprint[];
  pendingId: RecordId | null;
  onEdit: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onPage: (status: TaskStatus, page: number) => void;
}) {
  const [openSubtasks, setOpenSubtasks] = useState<Record<string, boolean>>({});
  const [subtaskLimits, setSubtaskLimits] = useState<Record<string, number>>(
    {},
  );
  const labelMap = labelsById(labels);
  const sprintNames = new Map(sprints.map((sprint) => [sprint._id, sprint.name]));

  const resolveLabels = (task: Task): Label[] =>
    task.label_ids
      .map((id) => labelMap.get(id))
      .filter((label): label is Label => !!label);

  const sprintName = (task: Task): string | null =>
    task.sprint_id ? (sprintNames.get(task.sprint_id) ?? null) : null;

  const visible = slices.filter(
    (slice) => slice.isLoading || slice.isError || slice.total > 0,
  );

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {visible.map((slice) => (
          <section
            key={slice.status}
            aria-label={STATUS_LABELS[slice.status]}
            className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm shadow-black/2"
          >
            <header className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                  STATUS_BADGE_CLASS[slice.status],
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    STATUS_DOT_CLASS[slice.status],
                  )}
                  aria-hidden
                />
                {STATUS_LABELS[slice.status]}
              </span>
              <span className="text-xs font-medium tabular-nums text-muted">
                {slice.isFetching && !slice.isLoading ? "Updating · " : ""}
                {formatTaskCount(slice.total)}
              </span>
            </header>

            {slice.isError ? (
              <p className="px-3 py-6 text-sm">
                Could not load {STATUS_LABELS[slice.status].toLowerCase()} tasks.
              </p>
            ) : null}

            {slice.isLoading ? (
              <p className="px-3 py-6 text-sm text-muted">Loading tasks…</p>
            ) : null}

            {!slice.isLoading && !slice.isError && slice.tasks.length === 0 ? (
              <p className="px-3 py-6 text-sm text-muted">
                No tasks on this page.
              </p>
            ) : null}

            {!slice.isLoading && !slice.isError && slice.tasks.length > 0 ? (
              <ul>
                {slice.tasks.map((task) => {
                  const children = task.children ?? [];
                  const expanded = !!openSubtasks[task._id];

                  return (
                    <li
                      key={task._id}
                      className="border-b border-border last:border-b-0"
                    >
                      <TaskRow
                        task={task}
                        labels={resolveLabels(task)}
                        sprintName={sprintName(task)}
                        pendingId={pendingId}
                        onEdit={onEdit}
                        onToggleDone={onToggleDone}
                      />
                      {children.length > 0 ? (
                        <div className="px-3 pb-2 pl-10">
                          <button
                            type="button"
                            aria-expanded={expanded}
                            onClick={() =>
                              setOpenSubtasks((current) => ({
                                ...current,
                                [task._id]: !current[task._id],
                              }))
                            }
                            className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-muted hover:text-foreground"
                          >
                            <ChevronDown
                              className={cn(
                                "h-3.5 w-3.5 transition-transform",
                                expanded && "rotate-180",
                              )}
                              aria-hidden
                            />
                            {children.length} subtask
                            {children.length === 1 ? "" : "s"}
                          </button>
                        </div>
                      ) : null}
                      {expanded ? (
                        <ul className="border-t border-border bg-accent-soft/40">
                          {children
                            .slice(0, subtaskLimits[task._id] ?? 8)
                            .map((child) => (
                              <li
                                key={child._id}
                                className="border-b border-border last:border-b-0"
                              >
                                <TaskRow
                                  task={child}
                                  labels={resolveLabels(child)}
                                  sprintName={sprintName(child)}
                                  pendingId={pendingId}
                                  nested
                                  onEdit={onEdit}
                                  onToggleDone={onToggleDone}
                                />
                              </li>
                            ))}
                          {children.length > (subtaskLimits[task._id] ?? 8) ? (
                            <li className="px-3 py-2 pl-10">
                              <button
                                type="button"
                                onClick={() =>
                                  setSubtaskLimits((current) => ({
                                    ...current,
                                    [task._id]: children.length,
                                  }))
                                }
                                className="cursor-pointer text-[11px] font-medium text-muted hover:text-foreground"
                              >
                                Show{" "}
                                {children.length - (subtaskLimits[task._id] ?? 8)}{" "}
                                more
                              </button>
                            </li>
                          ) : null}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            <SectionPager slice={slice} onPage={onPage} />
          </section>
      ))}
    </div>
  );
}
