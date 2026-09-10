"use client";

import { Columns3, ListPlus, Table2 } from "lucide-react";
import { FC, useState } from "react";
import { Button, IconButton } from "@/components/common";
import TaskKanbanBoard from "@/components/tasks/TaskKanbanBoard";
import TaskSummaryTable from "@/components/tasks/TaskSummaryTable";
import type { SprintDetailViewModel } from "./hooks/useSprintDetail";

interface Props {
  view: SprintDetailViewModel;
}

const SprintTasks: FC<Props> = ({ view }) => {
  const {
    labels,
    tasks,
    taskTotal,
    isTasksLoading,
    isTasksError,
    isTasksEmpty,
    pendingId,
    actionError,
    openEditTask,
    openAddTasks,
    changeTaskStatus,
  } = view;
  const [taskView, setTaskView] = useState<"table" | "board">("table");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Tasks in this sprint
        </p>
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
        <p className="text-sm text-foreground">
          Could not load sprint tasks. Try refreshing the page.
        </p>
      )}

      {actionError && <p className="text-sm text-foreground">{actionError}</p>}

      {isTasksEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">No tasks in this sprint</p>
          <p className="mt-1 text-sm text-muted">
            Add existing tasks from the backlog, or create a new one.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button
              onClick={openAddTasks}
              startIcon={<ListPlus className="w-4" aria-hidden />}
            >
              Add tasks
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
          <TaskSummaryTable
            tasks={tasks}
            labels={labels}
            onEdit={openEditTask}
          />
        ))}
    </>
  );
};

export default SprintTasks;
