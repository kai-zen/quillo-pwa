"use client";

import { FC, useMemo } from "react";
import { Button, Modal, Stepper } from "@/components/common";
import {
  AddDayTasksModals,
  AddDayTasksPanel,
} from "@/components/tasks/add-day-tasks";
import {
  addDays,
  formatDayHeading,
  formatDayShort,
} from "@/components/tasks/helpers";
import DailyReviewForm from "./DailyReviewForm";
import type { FinishDayStep, FinishDayViewModel } from "./useFinishDay";
import DailyProgressInputsForm, {
  useDailyProgressInputs,
} from "./daily-progress-inputs-form";

interface Props {
  date: string;
  view: FinishDayViewModel;
}

const FinishDayModal: FC<Props> = ({ date, view }) => {
  const nextDate = addDays(date, 1);
  const nextDateLabel = formatDayShort(nextDate);
  const progressForm = useDailyProgressInputs(
    date,
    view.sprintProgresses,
    view.open && view.hasProgressStep,
  );

  const steps = useMemo(() => {
    const items: { value: FinishDayStep; label: string }[] = [
      { value: 1, label: "Reflect" },
    ];
    if (view.hasProgressStep) {
      items.push({ value: 2, label: "Track progress" });
    }
    items.push({ value: view.planStep, label: "Plan ahead" });
    return items;
  }, [view.hasProgressStep, view.planStep]);

  const title =
    view.step === 1
      ? `Finish ${formatDayHeading(date)}`
      : view.step === 2 && view.hasProgressStep
        ? `Track ${formatDayShort(date)}`
        : `Plan ${nextDateLabel}`;

  return (
    <>
      <Modal
        open={view.open}
        onClose={view.closeFinishDay}
        title={title}
        className="max-w-3xl sm:max-h-[90vh]"
      >
        <Stepper
          value={view.step}
          steps={steps}
          aria-label="Finish day progress"
          className="mb-5"
        />

        {view.isError ? (
          <p className="text-sm text-foreground">
            Could not load the review for this day. Try refreshing the page.
          </p>
        ) : view.step === 1 ? (
          <DailyReviewForm
            form={view}
            onCancel={view.closeFinishDay}
            onSaved={view.advanceFromReflect}
            submitLabel="Continue"
          />
        ) : view.step === 2 && view.hasProgressStep ? (
          <DailyProgressInputsForm
            dateLabel={formatDayShort(nextDate)}
            progresses={view.sprintProgresses}
            form={progressForm}
            onCancel={view.closeFinishDay}
            onBack={view.backToReflect}
            onSaved={view.advanceFromProgress}
          />
        ) : (
          <AddDayTasksPanel
            doingDate={nextDate}
            activeSprint={view.activeSprint}
            description={
              <p className="text-sm text-muted">
                What do you want to tackle on {nextDateLabel}? Add a few tasks
                now so tomorrow starts with a plan.
              </p>
            }
            onCreateNewTask={view.openCreateTask}
            onAddFromRoutines={() => view.openAddPanel("routines")}
            onAddFromBacklog={() => view.openAddPanel("backlog")}
            onAddFromSprint={() => view.openAddPanel("sprint")}
            footer={
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={view.backFromPlan}>
                  Back
                </Button>
                <Button onClick={view.closeFinishDay}>Done</Button>
              </div>
            }
          />
        )}
      </Modal>

      <AddDayTasksModals
        doingDate={nextDate}
        source={view.addPanel}
        createOpen={view.createOpen}
        activeSprint={view.activeSprint}
        onCloseSource={view.closeAddPanel}
        onCloseCreate={view.closeCreateTask}
      />
    </>
  );
};

export default FinishDayModal;
