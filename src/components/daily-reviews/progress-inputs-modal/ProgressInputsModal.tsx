"use client";

import { FC } from "react";
import { Modal } from "@/components/common";
import { formatDayShort } from "@/components/tasks/helpers";
import DailyProgressInputsForm, {
  useDailyProgressInputs,
} from "../daily-progress-inputs-form";
import type { FinishDayViewModel } from "../useFinishDay";

interface Props {
  date: string;
  view: FinishDayViewModel;
}

const ProgressInputsModal: FC<Props> = ({ date, view }) => {
  const dateLabel = formatDayShort(date);
  const progressForm = useDailyProgressInputs(
    date,
    view.sprintProgresses,
    view.progressPanelOpen && view.hasProgressStep,
  );

  if (!view.hasProgressStep) return null;

  return (
    <Modal
      open={view.progressPanelOpen}
      onClose={view.closeProgressPanel}
      title={`Track ${dateLabel}`}
      className="max-w-3xl sm:max-h-[90vh]"
    >
      <DailyProgressInputsForm
        dateLabel={dateLabel}
        progresses={view.sprintProgresses}
        form={progressForm}
        onCancel={view.closeProgressPanel}
        onSaved={view.closeProgressPanel}
        submitLabel="Save progress"
      />
    </Modal>
  );
};

export default ProgressInputsModal;
