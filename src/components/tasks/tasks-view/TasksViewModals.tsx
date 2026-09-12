"use client";

import { FC, useMemo } from "react";
import { ConfirmModal, Modal } from "@/components/common";
import { ApplyRoutinesModal } from "@/components/routines";
import { pickActiveSprint } from "@/components/sprints/helpers";
import { AddDayTasksModal } from "../add-day-tasks";
import TaskForm, { taskFormTitle } from "../form/TaskForm";
import type { TasksDayViewModel } from "../useTasksDayView";

interface Props {
  view: TasksDayViewModel;
}

const TasksViewModals: FC<Props> = ({ view }) => {
  const {
    selectedDate,
    formMode,
    addTasksOpen,
    labels,
    sprints,
    pendingId,
    closeAddTasks,
    openCreate,
    closeForm,
    applyOpen,
    openApply,
    closeApply,
    toDelete,
    clearDelete,
    confirmDelete,
  } = view;

  const activeSprint = useMemo(() => pickActiveSprint(sprints), [sprints]);

  return (
    <>
      <AddDayTasksModal
        open={addTasksOpen}
        doingDate={selectedDate}
        activeSprint={activeSprint}
        onClose={closeAddTasks}
      />

      <Modal
        open={!!formMode}
        onClose={closeForm}
        title={formMode ? taskFormTitle(formMode) : ""}
        className="max-w-3xl"
      >
        {formMode && (
          <TaskForm
            key={
              formMode.type === "edit"
                ? formMode.task._id
                : `create-${formMode.parentId ?? "root"}-${selectedDate}`
            }
            mode={formMode}
            labels={labels}
            sprints={sprints}
            onClose={closeForm}
            onSaved={closeForm}
            onCreateSubtask={
              formMode.type === "edit" && !formMode.task.parent_id
                ? () => openCreate(formMode.task)
                : undefined
            }
            onEditSubtask={(task) => view.openEdit(task)}
            onAddFromRoutines={
              formMode.type === "create" && formMode.sprintId
                ? () => {
                    closeForm();
                    openApply();
                  }
                : undefined
            }
          />
        )}
      </Modal>

      <ApplyRoutinesModal
        open={applyOpen}
        doingDate={selectedDate}
        onClose={closeApply}
      />

      <ConfirmModal
        open={!!toDelete}
        title="Delete task"
        description={toDelete ? `Delete “${toDelete.title}”?` : undefined}
        confirmLabel="Delete"
        pending={!!pendingId}
        pendingLabel="Deleting…"
        onClose={clearDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default TasksViewModals;
