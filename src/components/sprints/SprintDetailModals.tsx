"use client";

import { FC } from "react";
import { Modal } from "@/components/common";
import TaskForm, { taskFormTitle } from "@/components/tasks/form/TaskForm";
import AddProgressToSprintModal from "./AddProgressToSprintModal";
import AddTasksToSprintModal from "./AddTasksToSprintModal";
import SprintForm, { sprintFormTitle } from "./form/SprintForm";
import type { SprintDetailViewModel } from "./hooks/useSprintDetail";

interface Props {
  view: SprintDetailViewModel;
}

const SprintDetailModals: FC<Props> = ({ view }) => {
  const {
    sprintId,
    sprint,
    sprintFormMode,
    taskFormMode,
    addTasksOpen,
    addProgressOpen,
    catalog,
    labels,
    closeSprintForm,
    onSprintSaved,
    openCreateTask,
    closeTaskForm,
    closeAddTasks,
    closeAddProgress,
  } = view;

  if (!sprint) return null;

  return (
    <>
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

      <AddProgressToSprintModal
        open={addProgressOpen}
        sprint={sprint}
        onClose={closeAddProgress}
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
    </>
  );
};

export default SprintDetailModals;
