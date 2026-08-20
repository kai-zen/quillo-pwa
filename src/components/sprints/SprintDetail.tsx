"use client";

import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { FC } from "react";
import { Button, IconButton, Markdown, Modal, cn } from "@/components/common";
import TaskForm, { taskFormTitle } from "@/components/tasks/form/TaskForm";
import TaskSummaryTable from "@/components/tasks/TaskSummaryTable";
import type { RecordId } from "@/shared/types";
import SprintForm, { sprintFormTitle } from "./form/SprintForm";
import {
  formatSprintRange,
  SPRINT_STATUS_BADGE_CLASS,
  SPRINT_STATUS_DOT_CLASS,
  SPRINT_STATUS_LABELS,
} from "./helpers";
import { useSprintDetail } from "./useSprintDetail";

interface Props {
  sprintId: RecordId;
}

const SprintDetail: FC<Props> = ({ sprintId }) => {
  const view = useSprintDetail(sprintId);
  const {
    sprint,
    sprintFormMode,
    taskFormMode,
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
    openEditSprint,
    closeSprintForm,
    onSprintSaved,
    openCreateTask,
    openEditTask,
    closeTaskForm,
  } = view;

  if (isSprintLoading)
    return (
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm text-muted">Loading sprint…</p>
      </div>
    );

  if (isSprintError || isSprintMissing || !sprint)
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Link
          href="/sprints"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All sprints
        </Link>
        <p className="text-sm text-foreground">
          {isSprintError
            ? "Could not load this sprint. Try refreshing the page."
            : "Sprint not found."}
        </p>
      </div>
    );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-4">
        <Link
          href="/sprints"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All sprints
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
            <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.03em] text-foreground">
              {sprint.name}
            </h1>
            <p className="mt-1.5 text-sm text-muted">
              {formatSprintRange(sprint.start_date, sprint.end_date)}
            </p>
            {sprint.description ? (
              <div className="mt-2 max-w-2xl">
                <Markdown compact>{sprint.description}</Markdown>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <IconButton label="Edit sprint" onClick={openEditSprint}>
              <Pencil className="h-4 w-4" aria-hidden />
            </IconButton>
            <Button onClick={() => openCreateTask()} className="shadow-sm">
              <Plus className="h-4 w-4" aria-hidden />
              New task
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Tasks in this sprint</p>
        <span className="text-xs font-medium tabular-nums text-muted">
          {taskTotal} task{taskTotal === 1 ? "" : "s"}
        </span>
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

      {isTasksEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">No tasks in this sprint</p>
          <p className="mt-1 text-sm text-muted">
            Add a task here, or assign one from the backlog.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => openCreateTask()}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New task
          </Button>
        </div>
      )}

      {!isTasksLoading && !isTasksError && tasks.length > 0 && (
        <TaskSummaryTable tasks={tasks} labels={labels} onEdit={openEditTask} />
      )}
    </div>
  );
};

export default SprintDetail;
