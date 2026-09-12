"use client";

import { Check, Plus, Search } from "lucide-react";
import { useId } from "react";
import { Button, Input, Modal, cn } from "@/components/common";
import {
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
} from "@/components/tasks/helpers";
import type { Project, RecordId, Task } from "@/shared/types";
import { useAddTasksToProject } from "./hooks/useAddTasksToProject";

interface Props {
  open: boolean;
  projectId: RecordId;
  projects: Project[];
  onClose: () => void;
  onCreateTask: () => void;
}

export default function AddTasksToProjectModal(props: Props) {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Add tasks to project"
      className="max-w-2xl"
    >
      {props.open && <Body {...props} />}
    </Modal>
  );
}

function Body({ projectId, projects, onClose, onCreateTask }: Props) {
  const searchId = useId();
  const view = useAddTasksToProject(projectId, projects, onClose);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Select existing tasks. Moving a task from another project keeps its
        sprint and doing date unchanged.
      </p>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor={searchId} className="sr-only">
            Search tasks
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            id={searchId}
            value={view.search}
            onChange={(event) => view.setSearch(event.target.value)}
            placeholder="Search by title or #"
            className="pl-9"
            autoFocus
            disabled={view.pending}
          />
        </div>
        <Button
          variant="secondary"
          onClick={onCreateTask}
          disabled={view.pending}
          startIcon={<Plus className="h-4 w-4" aria-hidden />}
        >
          New task
        </Button>
      </div>
      {view.visible.length > 0 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="cursor-pointer text-xs font-medium text-muted hover:text-foreground disabled:cursor-not-allowed"
            onClick={view.toggleAllVisible}
            disabled={view.pending}
          >
            {view.allVisibleSelected ? "Clear visible" : "Select visible"}
          </button>
          <span className="text-xs font-medium tabular-nums text-muted">
            {view.selectedCount} selected
          </span>
        </div>
      )}
      {view.isLoading && <p className="text-sm text-muted">Loading tasks…</p>}
      {view.isError && (
        <p className="text-sm">Could not load tasks. Try opening this again.</p>
      )}
      {view.isEmpty && (
        <Empty
          title="No tasks to add"
          text="Every task is already in this project, or you have no tasks yet."
        />
      )}
      {view.isFilterEmpty && (
        <Empty
          title="No matching tasks"
          text="Try a different title or task number."
        />
      )}
      {view.visible.length > 0 && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-label="Tasks to add"
          className="max-h-[50vh] overflow-y-auto rounded-xl border border-border"
        >
          {view.visible.map((task) => (
            <TaskOption
              key={task._id}
              task={task}
              selected={view.selectedIds.has(task._id)}
              projectLabel={view.currentProjectLabel(task)}
              disabled={view.pending}
              onToggle={() => view.toggle(task._id)}
            />
          ))}
        </ul>
      )}
      {view.isTruncated && (
        <p className="text-xs text-muted">
          Showing the first 100 tasks. Tasks already in this project are hidden.
        </p>
      )}
      {view.error && <p className="text-sm text-rose-500">{view.error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onClose} disabled={view.pending}>
          Cancel
        </Button>
        <Button
          onClick={view.onSubmit}
          disabled={view.pending || view.selectedCount === 0}
        >
          {view.pending
            ? "Adding…"
            : view.selectedCount
              ? `Add ${view.selectedCount} task${view.selectedCount === 1 ? "" : "s"}`
              : "Add tasks"}
        </Button>
      </div>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}

function TaskOption({
  task,
  selected,
  projectLabel,
  disabled,
  onToggle,
}: {
  task: Task;
  selected: boolean;
  projectLabel: string | null;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? undefined : 0}
      onClick={() => !disabled && onToggle()}
      onKeyDown={(event) => {
        if (!disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "flex cursor-pointer items-start gap-3 border-b border-border px-3 py-2.5 last:border-b-0 hover:bg-accent-soft focus-visible:outline-none",
        selected && "bg-accent-soft/70",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-border text-transparent",
        )}
        aria-hidden
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-semibold text-muted">
            #{task.task_number}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold",
              STATUS_BADGE_CLASS[task.status],
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                STATUS_DOT_CLASS[task.status],
              )}
              aria-hidden
            />
            {STATUS_LABELS[task.status]}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm font-medium">{task.title}</p>
        <p className="mt-0.5 text-xs text-muted">
          {projectLabel ? `Currently in ${projectLabel}` : "Unassigned"}
        </p>
      </div>
    </li>
  );
}
