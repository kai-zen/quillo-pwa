"use client";

import { Modal } from "@/components/common";
import { SprintForm, sprintFormTitle } from "@/components/sprints";
import GoalForm, { goalFormTitle } from "./form/GoalForm";
import type { GoalDetailViewModel } from "./hooks/useGoalDetail";

export default function GoalDetailModals({ view }: { view: GoalDetailViewModel }) {
  const {
    goal,
    goalFormMode,
    sprintFormMode,
    closeGoalForm,
    closeSprintForm,
    onGoalSaved,
    onSprintSaved,
  } = view;

  if (!goal) return null;

  return (
    <>
      <Modal
        open={!!goalFormMode}
        onClose={closeGoalForm}
        title={goalFormMode ? goalFormTitle(goalFormMode) : ""}
        className="max-w-3xl"
      >
        {goalFormMode && (
          <GoalForm
            key={
              goalFormMode.type === "edit" ? goalFormMode.goal?._id : "create"
            }
            mode={goalFormMode}
            onClose={closeGoalForm}
            onSaved={onGoalSaved}
          />
        )}
      </Modal>

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
                : `create-${goal._id}`
            }
            mode={sprintFormMode}
            onClose={closeSprintForm}
            onSaved={onSprintSaved}
          />
        )}
      </Modal>
    </>
  );
}
