"use client";

import { Columns3, ListPlus, Pencil, Table2 } from "lucide-react";
import { FC, useState } from "react";
import {
  Button,
  IconButton,
  Markdown,
  Modal,
  PageHeader,
  cn,
} from "@/components/common";
import TaskForm, { taskFormTitle } from "@/components/tasks/form/TaskForm";
import TaskKanbanBoard from "@/components/tasks/TaskKanbanBoard";
import TaskSummaryTable from "@/components/tasks/TaskSummaryTable";
import type { RecordId } from "@/shared/types";
import AddTasksToSprintModal from "./AddTasksToSprintModal";
import SprintForm, { sprintFormTitle } from "./form/SprintForm";
import {
  formatSprintRange,
  SPRINT_STATUS_BADGE_CLASS,
  SPRINT_STATUS_DOT_CLASS,
  SPRINT_STATUS_LABELS,
} from "./helpers";
import { useSprintDetail } from "./hooks/useSprintDetail";

interface Props {
  sprintId: RecordId;
}

const SprintDetail: FC<Props> = ({ sprintId }) => {
  const view = useSprintDetail(sprintId);
  const {
    sprint,
    sprintFormMode,
    taskFormMode,
    addTasksOpen,
    catalog,
    labels,
    tasks,
    taskTotal,
    isSprintLoading,
    isSprintError,
    isSprintMissing,
    isTasksLoading,
    isTasksError,
    isTasksEmpty,
    pendingId,
    actionError,
    openEditSprint,
    closeSprintForm,
    onSprintSaved,
    openCreateTask,
    openEditTask,
    closeTaskForm,
    openAddTasks,
    closeAddTasks,
    changeTaskStatus,
  } = view;
  const [taskView, setTaskView] = useState<"table" | "board">("table");

  if (isSprintLoading)
    return (
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm text-muted">Loading sprint…</p>
      </div>
    );

  if (isSprintError || isSprintMissing || !sprint)
    return (
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          title={isSprintError ? "Could not load sprint" : "Sprint not found"}
          description={
            isSprintError
              ? "Try refreshing the page."
              : "This sprint may have been deleted."
          }
          back={{ href: "/sprints", label: "All sprints" }}
        />
      </div>
    );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title={sprint.name}
        description={formatSprintRange(sprint.start_date, sprint.end_date)}
        back={{ href: "/sprints", label: "All sprints" }}
        eyebrow={
          <>
            <span className="font-mono text-xs font-semibold tabular-nums text-muted">
              #{sprint.sprint_number}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                SPRINT_STATUS_BADGE_CLASS[sprint.status],
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  SPRINT_STATUS_DOT_CLASS[sprint.status],
                )}
                aria-hidden
              />
              {SPRINT_STATUS_LABELS[sprint.status]}
            </span>
          </>
        }
        actions={
          <>
            <IconButton label="Edit sprint" onClick={openEditSprint}>
              <Pencil className="h-4 w-4" aria-hidden />
            </IconButton>
            <Button onClick={openAddTasks} className="shadow-sm">
              <ListPlus className="h-4 w-4" aria-hidden />
              Add tasks
            </Button>
          </>
        }
      >
        {sprint.description ? (
          <Markdown compact>{sprint.description}</Markdown>
        ) : null}
      </PageHeader>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Tasks in this sprint</p>
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

      <Modal
        open={!!sprintFormMode}
        onClose={closeSprintForm}
        title={sprintFormMode ? sprintFormTitle(sprintFormMode) : ""}
        className="max-w-3xl"
      >
        {sprintFormMode && (
          <SprintForm
            key={
              sprintFormMode.type === "edit"
                ? sprintFormMode.sprint._id
                : "create"
            }
            mode={sprintFormMode}
            onClose={closeSprintForm}
            onSaved={onSprintSaved}
          />
        )}
      </Modal>

      <AddTasksToSprintModal
        open={addTasksOpen}
        sprintId={sprintId}
        sprints={catalog}
        onClose={closeAddTasks}
        onCreateTask={() => {
          closeAddTasks();
          openCreateTask();
        }}
      />

      <Modal
        open={!!taskFormMode}
        onClose={closeTaskForm}
        title={taskFormMode ? taskFormTitle(taskFormMode) : ""}
        className="max-w-3xl"
      >
        {taskFormMode && (
          <TaskForm
            key={
              taskFormMode.type === "edit"
                ? taskFormMode.task._id
                : `create-${taskFormMode.parentId ?? "root"}-${sprintId}`
            }
            mode={taskFormMode}
            labels={labels}
            sprints={catalog}
            onClose={closeTaskForm}
            onSaved={closeTaskForm}
            onCreateSubtask={
              taskFormMode.type === "edit" && !taskFormMode.task.parent_id
                ? () => openCreateTask(taskFormMode.task)
                : undefined
            }
          />
        )}
      </Modal>

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
    </div>
  );
};

export default SprintDetail;
