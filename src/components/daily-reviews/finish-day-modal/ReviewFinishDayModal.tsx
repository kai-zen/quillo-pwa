import { FC } from "react";
import { Modal, Tabs } from "@/components/common";
import { formatDayHeading, formatDayShort } from "@/components/tasks/helpers";
import { FinishDayViewModel } from "../useFinishDay";
import DailyReviewForm from "../DailyReviewForm";
import DailyProgressInputsForm from "../daily-progress-inputs-form";
import { ProgressFormValues } from "../daily-progress-inputs-form/useDailyProgressInputs";

interface Props {
  date: string;
  view: FinishDayViewModel;
  progressForm: ProgressFormValues;
}

const ReviewFinishDayModal: FC<Props> = ({ date, view, progressForm }) => {
  const dateLabel = formatDayShort(date);

  return (
    <Modal
      open={view.open}
      onClose={view.closeFinishDay}
      title={`Review ${formatDayHeading(date)}`}
      className="max-w-3xl sm:max-h-[90vh]"
    >
      {view.isError ? (
        <p className="text-sm text-foreground">
          Could not load the review for this day. Try refreshing the page.
        </p>
      ) : (
        <>
          {view.hasProgressStep ? (
            <Tabs
              value={view.reviewTab}
              onChange={(value) =>
                view.setReviewTab(value as "reflect" | "progress")
              }
              options={[
                { value: "reflect", label: "Reflect" },
                { value: "progress", label: "Progress" },
              ]}
              aria-label="Daily review sections"
              className="mb-5"
            />
          ) : null}

          {view.reviewTab === "reflect" || !view.hasProgressStep ? (
            <DailyReviewForm form={view} submitLabel="Save changes" />
          ) : (
            <DailyProgressInputsForm
              dateLabel={dateLabel}
              progresses={view.sprintProgresses}
              form={progressForm}
              submitLabel="Save changes"
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default ReviewFinishDayModal;
