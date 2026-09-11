"use client";

import { FC, useMemo } from "react";
import { Button, Modal, Stepper } from "@/components/common";
import { pickActiveSprint } from "@/components/sprints/helpers";
import {
  AddDayTasksModals,
  AddDayTasksPanel,
} from "@/components/tasks/add-day-tasks";
import { addDays, formatDayHeading, formatDayShort } from "@/components/tasks/helpers";
import { useSprintsApi } from "@/shared/hooks";
import DailyReviewForm from "./DailyReviewForm";
import type { FinishDayStep, FinishDayViewModel } from "./useFinishDay";

const STEPS: { value: FinishDayStep; label: string }[] = [
  { value: 1, label: "Reflect" },
  { value: 2, label: "Plan ahead" },
];

interface Props {
  date: string;
  view: FinishDayViewModel;
}

const FinishDayModal: FC<Props> = ({ date, view }) => {
  const nextDate = addDays(date, 1);
  const { useSprintsList } = useSprintsApi();
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const activeSprint = useMemo(
    () => pickActiveSprint(sprintsQuery.data?.items ?? []),
    [sprintsQuery.data?.items],
  );
  const nextDateLabel = formatDayShort(nextDate);

  const title =
    view.step === 1
      ? `Finish ${formatDayHeading(date)}`
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
          steps={STEPS}
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
            onSaved={view.goToStep2}
            submitLabel="Continue"
          />
        ) : (
          <AddDayTasksPanel
            doingDate={nextDate}
            activeSprint={activeSprint}
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
                <Button variant="ghost" onClick={view.backToStep1}>
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
        activeSprint={activeSprint}
        onCloseSource={view.closeAddPanel}
        onCloseCreate={view.closeCreateTask}
      />
    </>
  );
};

export default FinishDayModal;
