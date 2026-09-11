"use client";

import { FC } from "react";
import { Modal, Tabs } from "@/components/common";
import { formatDayHeading, formatDayShort } from "@/components/tasks/helpers";
import DailyReviewForm from "../DailyReviewForm";
import DailyProgressInputsForm from "../daily-progress-inputs-form";
import { ProgressFormValues } from "../daily-progress-inputs-form/useDailyProgressInputs";
import { FinishDayViewModel } from "../useFinishDay";
import DailyProgressReader from "./DailyProgressReader";
import DailyReviewReader from "./DailyReviewReader";

interface Props {
  date: string;
  view: FinishDayViewModel;
  progressForm: ProgressFormValues;
}

const ReviewFinishDayModal: FC<Props> = ({ date, view, progressForm }) => {
  const dateLabel = formatDayShort(date);
  const review = view.review;

  if (!review) return null;

  const onReviewTabChange = (value: string) => {
    if (view.reviewEditing === "reflect") {
      view.cancelReviewEdit("reflect");
    } else if (view.reviewEditing === "progress") {
      progressForm.resetEdits();
      view.cancelReviewEdit("progress");
    }
    view.setReviewTab(value as "reflect" | "progress");
  };

  const cancelProgressEdit = () => {
    progressForm.resetEdits();
    view.cancelReviewEdit("progress");
  };

  const showReflect =
    view.reviewTab === "reflect" || !view.hasProgressStep;
  const editingReflect = view.reviewEditing === "reflect";
  const editingProgress = view.reviewEditing === "progress";

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
              onChange={onReviewTabChange}
              options={[
                { value: "reflect", label: "Reflect" },
                { value: "progress", label: "Progress" },
              ]}
              aria-label="Daily review sections"
              className="mb-5"
            />
          ) : null}

          {showReflect ? (
            editingReflect ? (
              <DailyReviewForm
                form={view}
                onCancel={() => view.cancelReviewEdit("reflect")}
                onSaved={view.finishReviewEdit}
                submitLabel="Save changes"
              />
            ) : (
              <DailyReviewReader
                mood={review.mood}
                journal={review.journal}
                onEdit={() => view.startReviewEdit("reflect")}
              />
            )
          ) : editingProgress ? (
            <DailyProgressInputsForm
              dateLabel={dateLabel}
              progresses={view.sprintProgresses}
              form={progressForm}
              onCancel={cancelProgressEdit}
              onSaved={view.finishReviewEdit}
              submitLabel="Save changes"
            />
          ) : (
            <DailyProgressReader
              progresses={view.sprintProgresses}
              values={progressForm.values}
              isLoading={progressForm.isLoading}
              isError={progressForm.isError}
              onEdit={() => view.startReviewEdit("progress")}
            />
          )}
        </>
      )}
    </Modal>
  );
};

export default ReviewFinishDayModal;
