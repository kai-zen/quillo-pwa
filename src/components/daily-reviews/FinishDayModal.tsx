"use client";

import { FC, useMemo } from "react";
import { Button, cn, Modal } from "@/components/common";
import { pickActiveSprint } from "@/components/sprints/helpers";
import {
  AddDayTasksModals,
  AddDayTasksPanel,
} from "@/components/tasks/add-day-tasks";
import { addDays, formatDayHeading, formatDayShort } from "@/components/tasks/helpers";
import { useSprintsApi } from "@/shared/hooks";
import DailyReviewForm from "./DailyReviewForm";
import type { FinishDayStep, FinishDayViewModel } from "./useFinishDay";

const STEPS: { step: FinishDayStep; label: string }[] = [
  { step: 1, label: "Reflect" },
  { step: 2, label: "Plan ahead" },
];

interface Props {
  date: string;
  view: FinishDayViewModel;
}

const StepIndicator: FC<{ step: FinishDayStep }> = ({ step }) => (
  <ol className="mb-5 flex items-center gap-2" aria-label="Finish day progress">
    {STEPS.map(({ step: n, label }, index) => {
      const active = step === n;
      const complete = step > n;

      return (
        <li key={n} className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-2",
              active || complete ? "text-foreground" : "text-muted",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                active && "bg-foreground text-background",
                complete && "bg-foreground/15 text-foreground",
                !active && !complete && "bg-accent-soft text-muted",
              )}
              aria-current={active ? "step" : undefined}
            >
              {n}
            </span>
            <span className="truncate text-xs font-medium">{label}</span>
          </span>
          {index < STEPS.length - 1 && (
            <span
              className={cn(
                "h-px min-w-4 flex-1",
                complete ? "bg-foreground/30" : "bg-border",
              )}
              aria-hidden
            />
          )}
        </li>
      );
    })}
  </ol>
);

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
        <StepIndicator step={view.step} />

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
