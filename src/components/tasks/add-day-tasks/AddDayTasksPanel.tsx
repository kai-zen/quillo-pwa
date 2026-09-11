"use client";

import { Inbox, Plus, Repeat, Target } from "lucide-react";
import { FC, ReactNode } from "react";
import { Button, ConfirmModal, Modal } from "@/components/common";
import TaskDayCards from "@/components/tasks/task-day-cards";
import TaskForm, { taskFormTitle } from "@/components/tasks/form/TaskForm";
import { formatDayShort } from "@/components/tasks/helpers";
import type { Sprint } from "@/shared/types";
import { useDayTaskListActions } from "./useDayTaskListActions";

interface Props {
  doingDate: string;
  activeSprint: Sprint | null;
  description?: ReactNode;
  onCreateNewTask: () => void;
  onAddFromRoutines: () => void;
  onAddFromBacklog: () => void;
  onAddFromSprint: () => void;
  footer?: ReactNode;
}

const AddDayTasksPanel: FC<Props> = ({
  doingDate,
  activeSprint,
  description,
  onCreateNewTask,
  onAddFromRoutines,
  onAddFromBacklog,
  onAddFromSprint,
  footer,
}) => {
  const view = useDayTaskListActions(doingDate);
  const dateLabel = formatDayShort(doingDate);

  return (
    <>
      <div className="flex flex-col gap-4">
        {description ?? (
          <p className="text-sm text-muted">
            Add tasks for {dateLabel} — create a new one or pull from somewhere
            you already planned.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted">Add tasks from:</p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={onCreateNewTask}
              size="sm"
              startIcon={<Plus className="h-4 w-4" aria-hidden />}
            >
              New task
            </Button>
            <Button variant="secondary" size="sm" onClick={onAddFromRoutines}>
              <Repeat className="h-4 w-4" aria-hidden />
              Routines
            </Button>
            <Button variant="secondary" size="sm" onClick={onAddFromBacklog}>
              <Inbox className="h-4 w-4" aria-hidden />
              Backlog
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddFromSprint}
              disabled={!activeSprint}
              title={
                activeSprint
                  ? `Add from ${activeSprint.name}`
                  : "No active sprint right now"
              }
            >
              <Target className="h-4 w-4" aria-hidden />
              Sprint
            </Button>
          </div>
        </div>

        {view.isLoading && (
          <p className="text-sm text-muted">Loading tasks for {dateLabel}…</p>
        )}

        {view.isError && (
          <p className="text-sm text-foreground">
            Could not load tasks for this day.
          </p>
        )}

        {!view.isLoading && !view.isError && view.tasks.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-8 text-center">
            <p className="text-sm text-muted">
              Nothing planned yet for {dateLabel}.
            </p>
          </div>
        )}

        {!view.isLoading && !view.isError && view.tasks.length > 0 && (
          <div className="max-h-[45vh] overflow-y-auto pr-0.5">
            <TaskDayCards
              tasks={view.tasks}
              labels={view.labels}
              pendingId={view.pendingId}
              onEdit={view.openEdit}
              onCreateSubtask={view.openCreateSubtask}
              onToggleDone={view.toggleDone}
              onDelete={view.setToDelete}
              onReorder={view.reorderTasks}
            />
          </div>
        )}

        {view.actionError && (
          <p className="text-sm text-foreground">{view.actionError}</p>
        )}

        {footer}
      </div>

      <Modal
        open={!!view.formMode}
        onClose={view.closeForm}
        title={view.formMode ? taskFormTitle(view.formMode) : ""}
        className="max-w-3xl sm:max-h-[90vh]"
      >
        {view.formMode && (
          <TaskForm
            key={
              view.formMode.type === "edit"
                ? view.formMode.task._id
                : `create-${view.formMode.parentId ?? "root"}-${doingDate}`
            }
            mode={view.formMode}
            labels={view.labels}
            sprints={view.sprints}
            onClose={view.closeForm}
            onSaved={view.closeForm}
            onCreateSubtask={
              view.formMode.type === "edit" && !view.formMode.task.parent_id
                ? () => {
                    const mode = view.formMode;
                    if (mode?.type === "edit")
                      view.openCreateSubtask(mode.task);
                  }
                : undefined
            }
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!view.toDelete}
        title="Delete task"
        description={
          view.toDelete ? `Delete “${view.toDelete.title}”?` : undefined
        }
        confirmLabel="Delete"
        pending={!!view.pendingId}
        pendingLabel="Deleting…"
        onClose={() => view.setToDelete(null)}
        onConfirm={view.confirmDelete}
      />
    </>
  );
};

export default AddDayTasksPanel;
