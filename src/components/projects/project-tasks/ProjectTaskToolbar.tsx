"use client";

import { Columns3, LayoutGrid, List, Search, X } from "lucide-react";
import { Button, IconButton, Select, cn } from "@/components/common";
import { TaskProgressBar } from "@/components/tasks/DayProgress";
import {
  PRIORITY_LABELS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
} from "@/components/tasks/helpers";
import type { Label, Sprint, TaskPriority } from "@/shared/types";
import { TASK_PRIORITIES } from "@/shared/types";
import {
  PROJECT_TASK_FOCUS_OPTIONS,
  formatTaskCount,
  type ProjectTaskFocus,
} from "./helpers";
import type { ProjectTaskBrowser } from "./useProjectTaskBrowser";

const focusName = (focus: ProjectTaskFocus): string =>
  focus === "open" ? "Open" : STATUS_LABELS[focus];

export default function ProjectTaskToolbar({
  browser,
  labels,
  sprints,
}: {
  browser: ProjectTaskBrowser;
  labels: Label[];
  sprints: Sprint[];
}) {
  const {
    focus,
    setFocus,
    layout,
    setLayout,
    searchInput,
    setSearchInput,
    labelId,
    setLabelId,
    sprintId,
    setSprintId,
    priority,
    setPriority,
    hasFilters,
    clearFilters,
    countByStatus,
    openCount,
    doneCount,
    projectTotal,
  } = browser;

  const progressReady = doneCount !== null && openCount !== null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm shadow-black/2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">Tasks</p>
        <p className="text-xs font-medium tabular-nums text-muted">
          {openCount === null ? "…" : `${formatTaskCount(openCount)} open`}
          <span className="px-1.5 text-border" aria-hidden>
            ·
          </span>
          {doneCount === null ? "…" : `${formatTaskCount(doneCount)} done`}
          {projectTotal !== null ? (
            <span className="text-muted/80">
              {" "}
              of {formatTaskCount(projectTotal)}
            </span>
          ) : null}
        </p>
      </div>

      {progressReady ? (
        <TaskProgressBar done={doneCount} total={doneCount + openCount} />
      ) : null}

      {layout === "start" ? (
        <p className="text-xs leading-relaxed text-muted">
          Only to-do tasks. High priority comes before low priority, and smaller
          story points come before larger ones.
        </p>
      ) : (
        <div
          className="flex gap-1.5 overflow-x-auto pb-0.5"
          role="radiogroup"
          aria-label="Group tasks by status"
        >
          {PROJECT_TASK_FOCUS_OPTIONS.map((option) => {
            const selected = focus === option;
            const count = option === "open" ? openCount : countByStatus[option];
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setFocus(option)}
                className={cn(
                  "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  selected
                    ? "border-transparent bg-foreground text-background"
                    : "border-border bg-surface text-muted hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {option !== "open" ? (
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      selected ? "bg-background" : STATUS_DOT_CLASS[option],
                    )}
                    aria-hidden
                  />
                ) : null}
                {focusName(option)}
                <span
                  className={cn("tabular-nums", selected ? "opacity-80" : "")}
                >
                  {count === null ? "…" : formatTaskCount(count)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-44 flex-1">
          <span className="sr-only">Search tasks</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search title, description, or #number"
            className="h-8 w-full rounded-lg border border-border bg-transparent py-1 pr-3 pl-8 text-xs outline-none focus:border-foreground"
          />
        </label>
        <label className="sr-only" htmlFor="project-task-label-filter">
          Filter by label
        </label>
        <Select
          id="project-task-label-filter"
          aria-label="Filter by label"
          sizeVariant="sm"
          value={labelId}
          onChange={(event) => setLabelId(event.target.value)}
        >
          <option value="">All labels</option>
          {labels.map((label) => (
            <option key={label._id} value={label._id}>
              {label.name}
            </option>
          ))}
        </Select>
        <label className="sr-only" htmlFor="project-task-sprint-filter">
          Filter by sprint
        </label>
        <Select
          id="project-task-sprint-filter"
          aria-label="Filter by sprint"
          sizeVariant="sm"
          value={sprintId}
          onChange={(event) => setSprintId(event.target.value)}
        >
          <option value="">All sprints</option>
          <option value="null">No sprint</option>
          {sprints.map((sprint) => (
            <option key={sprint._id} value={sprint._id}>
              {sprint.name}
            </option>
          ))}
        </Select>
        <label className="sr-only" htmlFor="project-task-priority-filter">
          Filter by priority
        </label>
        <Select
          id="project-task-priority-filter"
          aria-label="Filter by priority"
          sizeVariant="sm"
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as TaskPriority | "")
          }
        >
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((value) => (
            <option key={value} value={value}>
              {PRIORITY_LABELS[value]}
            </option>
          ))}
        </Select>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            startIcon={<X className="h-3.5 w-3.5" aria-hidden />}
          >
            Clear
          </Button>
        ) : null}
        <div
          className="ml-auto inline-flex items-center rounded-lg border border-border bg-surface p-0.5"
          role="group"
          aria-label="Task layout"
        >
          <IconButton
            label="List"
            size="sm"
            active={layout === "list"}
            aria-pressed={layout === "list"}
            onClick={() => setLayout("list")}
          >
            <List className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
          <IconButton
            label="Board"
            size="sm"
            active={layout === "board"}
            aria-pressed={layout === "board"}
            onClick={() => setLayout("board")}
          >
            <Columns3 className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
          <IconButton
            label="Start next"
            size="sm"
            active={layout === "start"}
            aria-pressed={layout === "start"}
            onClick={() => setLayout("start")}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
