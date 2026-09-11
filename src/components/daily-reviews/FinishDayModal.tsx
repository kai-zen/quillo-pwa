"use client";

import { FC } from "react";
import { cn, Modal } from "@/components/common";
import { ApplyRoutinesModal } from "@/components/routines";
import { addDays, formatDayHeading, formatDayShort } from "@/components/tasks/helpers";
import DailyReviewForm from "./DailyReviewForm";
import NextDayTasksStep from "./NextDayTasksStep";
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
  const title =
    view.step === 1
      ? `Finish ${formatDayHeading(date)}`
      : `Plan ${formatDayShort(nextDate)}`;

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
          <NextDayTasksStep
            nextDate={nextDate}
            onBack={view.backToStep1}
            onDone={view.closeFinishDay}
            onApplyRoutines={view.openApply}
          />
        )}
      </Modal>

      <ApplyRoutinesModal
        open={view.applyOpen}
        doingDate={nextDate}
        onClose={view.closeApply}
      />
    </>
  );
};

export default FinishDayModal;
