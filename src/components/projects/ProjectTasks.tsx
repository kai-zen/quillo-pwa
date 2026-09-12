"use client";

import { Columns3, ListPlus, Plus, Table2 } from "lucide-react";
import { Button, IconButton } from "@/components/common";
import TaskKanbanBoard from "@/components/tasks/TaskKanbanBoard";
import TaskDayCards from "@/components/tasks/task-day-cards/TaskDayCards";
import type { RecordId } from "@/shared/types";
import type { ProjectDetailViewModel } from "./hooks/useProjectDetail";

export default function ProjectTasks({
  view,
}: {
  view: ProjectDetailViewModel;
}) {
  const {
    labels,
    tasks,
    taskTotal,
    taskView,
    setTaskView,
    page,
    setPage,
    totalPages,
    isTasksLoading,
    isTasksError,
    isTasksEmpty,
    isTasksFetching,
    pendingId,
    actionError,
    openEditTask,
    openCreateTask,
    openAddTasks,
    changeTaskStatus,
  } = view;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">Tasks in this project</p>
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center rounded-lg border border-border bg-surface p-0.5"
            role="group"
            aria-label="Task list view"
          >
            <IconButton
              label="Table view"
              size="sm"
              active={taskView === "table"}
              aria-pressed={taskView === "table"}
              onClick={() => setTaskView("table")}
            >
              <Table2 className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Board view"
              size="sm"
              active={taskView === "board"}
              aria-pressed={taskView === "board"}
              onClick={() => setTaskView("board")}
            >
              <Columns3 className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
          </div>
          <span className="text-xs font-medium tabular-nums text-muted">
            {taskTotal} task{taskTotal === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      {isTasksLoading && <p className="text-sm text-muted">Loading tasks…</p>}
      {isTasksError && (
        <p className="text-sm">
          Could not load project tasks. Try refreshing the page.
        </p>
      )}
      {actionError && <p className="text-sm text-rose-500">{actionError}</p>}
      {isTasksEmpty && (
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
      )}
      {!isTasksLoading &&
        !isTasksError &&
        tasks.length > 0 &&
        (taskView === "board" ? (
          <TaskKanbanBoard
            tasks={tasks}
            labels={labels}
            pendingId={pendingId}
            onEdit={openEditTask}
            onStatusChange={changeTaskStatus}
          />
        ) : (
          <TaskDayCards
            tasks={tasks}
            labels={labels}
            pendingId={pendingId}
            onEdit={openEditTask}
            onCreateSubtask={openCreateTask}
            onToggleDone={(taskOrId) => {
              const id = (taskOrId?._id || taskOrId) as RecordId;
              const task = tasks.find((item) => item._id === id);
              if (task)
                changeTaskStatus(
                  task,
                  task.status === "done" ? "todo" : "done",
                );
            }}
            onDelete={openEditTask}
          />
        ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page <= 1 || isTasksFetching}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page >= totalPages || isTasksFetching}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  );
}
