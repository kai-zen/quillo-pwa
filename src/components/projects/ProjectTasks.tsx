"use client";

import { ListPlus, Plus } from "lucide-react";
import { Button } from "@/components/common";
import type { Task } from "@/shared/types";
import type { ProjectDetailViewModel } from "./hooks/useProjectDetail";
import ProjectTaskBoard from "./project-tasks/ProjectTaskBoard";
import ProjectTaskSections from "./project-tasks/ProjectTaskSections";
import ProjectTaskStart from "./project-tasks/ProjectTaskStart";
import ProjectTaskToolbar from "./project-tasks/ProjectTaskToolbar";

export default function ProjectTasks({
  view,
}: {
  view: ProjectDetailViewModel;
}) {
  const {
    labels,
    sprints,
    taskBrowser,
    openEditTask,
    openCreateTask,
    openAddTasks,
  } = view;
  const {
    layout,
    focus,
    setFocus,
    slices,
    boardSlices,
    listState,
    startNext,
    doneCount,
    pendingId,
    actionError,
    hasFilters,
    clearFilters,
    setStatusPage,
    changeTaskStatus,
  } = taskBrowser;

  const toggleDone = (task: Task) => {
    changeTaskStatus(task, task.status === "done" ? "todo" : "done");
  };

  return (
    <section className="flex min-w-0 w-full flex-col gap-3">
      <ProjectTaskToolbar browser={taskBrowser} labels={labels} sprints={sprints} />
      {actionError ? <p className="text-sm text-rose-500">{actionError}</p> : null}

      {layout === "list" && listState === "loading" ? (
        <p className="text-sm text-muted">Loading tasks…</p>
      ) : null}

      {layout === "list" && listState === "error" ? (
        <p className="text-sm">
          Could not load project tasks. Try refreshing the page.
        </p>
      ) : null}

      {listState === "empty-project" ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium">No tasks in this project</p>
          <p className="mt-1 text-sm text-muted">
            Add existing tasks, or create a new one.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              onClick={openAddTasks}
              startIcon={<ListPlus className="h-4 w-4" aria-hidden />}
            >
              Add tasks
            </Button>
            <Button
              variant="secondary"
              onClick={() => openCreateTask()}
              startIcon={<Plus className="h-4 w-4" aria-hidden />}
            >
              New task
            </Button>
          </div>
        </div>
      ) : null}

      {layout === "list" && listState === "empty-focus" ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
          <p className="font-medium">
            {focus === "open" ? "No open tasks" : "Nothing in this group"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {focus === "open"
              ? "Doing, to do, and paused tasks show here. Finished work stays in Done."
              : "Tasks in this status will show up here."}
          </p>
          {focus === "open" && doneCount ? (
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setFocus("done")}
            >
              View {doneCount.toLocaleString()} done
            </Button>
          ) : null}
        </div>
      ) : null}

      {layout === "list" && listState === "empty-filter" ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
          <p className="font-medium">No tasks match</p>
          <p className="mt-1 text-sm text-muted">
            Try another search, label, sprint, or priority.
          </p>
          {hasFilters ? (
            <Button variant="secondary" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : null}

      {layout === "start" && listState !== "empty-project" ? (
        <ProjectTaskStart
          startNext={startNext}
          labels={labels}
          sprints={sprints}
          pendingId={pendingId}
          hasFilters={hasFilters}
          onEdit={openEditTask}
          onStart={(task) => changeTaskStatus(task, "doing")}
        />
      ) : null}

      {layout === "board" && listState !== "empty-project" ? (
        <ProjectTaskBoard
          slices={boardSlices}
          labels={labels}
          sprints={sprints}
          pendingId={pendingId}
          onEdit={openEditTask}
          onStatusChange={changeTaskStatus}
          onPage={setStatusPage}
        />
      ) : null}

      {layout === "list" && listState === "ready" ? (
        <ProjectTaskSections
          slices={slices}
          labels={labels}
          sprints={sprints}
          pendingId={pendingId}
          onEdit={openEditTask}
          onToggleDone={toggleDone}
          onPage={setStatusPage}
        />
      ) : null}
    </section>
  );
}
