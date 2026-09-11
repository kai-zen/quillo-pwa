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
import DailyReviewForm from "../DailyReviewForm";
import type { FinishDayStep, FinishDayViewModel } from "../useFinishDay";
import DailyProgressInputsForm, {
  useDailyProgressInputs,
} from "../daily-progress-inputs-form";
import ReviewFinishDayModal from "./ReviewFinishDayModal";

interface Props {
  date: string;
  view: FinishDayViewModel;
}

const FinishDayModal: FC<Props> = ({ date, view }) => {
  const nextDate = addDays(date, 1);
  const nextDateLabel = formatDayShort(nextDate);
  const dateLabel = formatDayShort(date);
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
    if (view.hasPlanStep) {
      items.push({ value: view.planStep, label: "Plan ahead" });
    }
    return items;
  }, [view.hasPlanStep, view.hasProgressStep, view.planStep]);

  const isReviewing = !view.isCreating;
  const isProgressStep = view.step === 2 && view.hasProgressStep;
  const isPlanStep = view.hasPlanStep && view.step === view.planStep;

  const createTitle =
    view.step === 1
      ? `Finish ${formatDayHeading(date)}`
      : isProgressStep
        ? `Track ${dateLabel}`
        : `Plan ${nextDateLabel}`;

  const progressSubmitLabel = view.hasPlanStep
    ? `Continue to plan ${nextDateLabel}`
    : "Save & finish";

  if (isReviewing)
    return (
      <ReviewFinishDayModal
        date={date}
        view={view}
        progressForm={progressForm}
      />
    );

  return (
    <>
      <Modal
        open={view.open}
        onClose={view.closeFinishDay}
        title={createTitle}
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
        ) : isProgressStep ? (
          <DailyProgressInputsForm
            dateLabel={dateLabel}
            progresses={view.sprintProgresses}
            form={progressForm}
            onCancel={view.closeFinishDay}
            onBack={view.backToReflect}
            onSaved={view.advanceFromProgress}
            submitLabel={progressSubmitLabel}
          />
        ) : isPlanStep ? (
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
        ) : null}
      </Modal>

      {view.hasPlanStep ? (
        <AddDayTasksModals
          doingDate={nextDate}
          source={view.addPanel}
          createOpen={view.createOpen}
          activeSprint={view.activeSprint}
          onCloseSource={view.closeAddPanel}
          onCloseCreate={view.closeCreateTask}
        />
      ) : null}
    </>
  );
};

export default FinishDayModal;
