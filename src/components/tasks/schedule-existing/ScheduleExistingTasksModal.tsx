"use client";

import { Check, Search } from "lucide-react";
import { FC, useId } from "react";
import { Button, Input, Modal, cn } from "@/components/common";
import {
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
  formatDayShort,
} from "@/components/tasks/helpers";
import type { RecordId, Task } from "@/shared/types";
import {
  type ScheduleTaskSource,
  useScheduleExistingTasks,
} from "./useScheduleExistingTasks";

interface Props {
  open: boolean;
  doingDate: string;
  source: ScheduleTaskSource;
  sprintId?: RecordId | null;
  sprintName?: string | null;
  onClose: () => void;
}

const TITLES: Record<ScheduleTaskSource, string> = {
  backlog: "Add from backlog",
  sprint: "Add from sprint",
};

const ScheduleExistingTasksModal: FC<Props> = ({
  open,
  doingDate,
  source,
  sprintId = null,
  sprintName,
  onClose,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={TITLES[source]}
    className="max-w-2xl"
  >
    {open && (
      <ScheduleExistingTasksBody
        doingDate={doingDate}
        source={source}
        sprintId={sprintId}
        sprintName={sprintName}
        onClose={onClose}
      />
    )}
  </Modal>
);

const ScheduleExistingTasksBody: FC<Omit<Props, "open">> = ({
  doingDate,
  source,
  sprintId,
  sprintName,
  onClose,
}) => {
  const searchId = useId();
  const dateLabel = formatDayShort(doingDate);
  const view = useScheduleExistingTasks(
    doingDate,
    source,
    sprintId ?? null,
    onClose,
  );
  const {
    search,
    setSearch,
    selectedIds,
    selectedCount,
    visible,
    allVisibleSelected,
    isLoading,
    isError,
    isEmpty,
    isFilterEmpty,
    isTruncated,
    pending,
    error,
    toggle,
    toggleAllVisible,
    scheduleHint,
    onSubmit,
  } = view;

  const description =
    source === "backlog"
      ? `Pick backlog tasks to schedule for ${dateLabel}.`
      : sprintName
        ? `Pick tasks from “${sprintName}” to schedule for ${dateLabel}.`
        : `Pick sprint tasks to schedule for ${dateLabel}.`;

  const emptyMessage =
    source === "backlog"
      ? "Your backlog is empty, or every task is already on this day."
      : "Every sprint task is already on this day, or the sprint has no open tasks.";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">{description}</p>

      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Search tasks
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          id={searchId}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title or #"
          className="pl-9"
          autoFocus
        />
      </div>

      {visible.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="cursor-pointer text-xs font-medium text-muted transition-colors hover:text-foreground"
            onClick={toggleAllVisible}
          >
            {allVisibleSelected ? "Clear visible" : "Select visible"}
          </button>
          <span className="text-xs font-medium tabular-nums text-muted">
            {selectedCount} selected
          </span>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted">Loading tasks…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load tasks. Try closing and opening this again.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
          <p className="font-medium text-foreground">No tasks to add</p>
          <p className="mt-1 text-sm text-muted">{emptyMessage}</p>
        </div>
      )}

      {isFilterEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
          <p className="font-medium text-foreground">No matching tasks</p>
          <p className="mt-1 text-sm text-muted">
            Try a different title or task number.
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-label="Tasks to schedule"
          className="max-h-[50vh] overflow-y-auto rounded-xl border border-border"
        >
          {visible.map((task) => (
            <TaskOption
              key={task._id}
              task={task}
              selected={selectedIds.has(task._id)}
              hint={scheduleHint(task)}
              disabled={pending}
              onToggle={() => toggle(task._id)}
            />
          ))}
        </ul>
      )}

      {isTruncated && (
        <p className="text-xs text-muted">
          Showing the first {100} tasks. Refine your search to find others.
        </p>
      )}

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={pending || selectedCount === 0}>
          {pending
            ? "Scheduling…"
            : selectedCount === 0
              ? "Schedule tasks"
              : selectedCount === 1
                ? "Schedule 1 task"
                : `Schedule ${selectedCount} tasks`}
        </Button>
      </div>
    </div>
  );
};

interface TaskOptionProps {
  task: Task;
  selected: boolean;
  hint: string;
  disabled: boolean;
  onToggle: () => void;
}

const TaskOption: FC<TaskOptionProps> = ({
  task,
  selected,
  hint,
  disabled,
  onToggle,
}) => (
  <li
    role="option"
    aria-selected={selected}
    aria-disabled={disabled || undefined}
    className={cn(
      "flex cursor-pointer items-start gap-3 border-b border-border px-3 py-2.5 last:border-b-0 transition-colors",
      "hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none",
      selected && "bg-accent-soft/70",
      disabled && "cursor-not-allowed opacity-50",
    )}
    tabIndex={disabled ? undefined : 0}
    onClick={() => {
      if (disabled) return;
      onToggle();
    }}
    onKeyDown={(event) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggle();
      }
    }}
  >
    <span
      className={cn(
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
        selected
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-surface text-transparent",
      )}
      aria-hidden
    >
      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
    </span>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-semibold tabular-nums text-muted">
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
      <p className="mt-0.5 truncate text-sm font-medium text-foreground">
        {task.title}
      </p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </div>
  </li>
);

export default ScheduleExistingTasksModal;
