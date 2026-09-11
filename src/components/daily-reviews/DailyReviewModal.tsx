"use client";

import { FC } from "react";
import { Modal } from "@/components/common";
import { formatDayHeading } from "@/components/tasks/helpers";
import DailyReviewForm from "./DailyReviewForm";
import type { useDailyReview } from "./useDailyReview";

interface Props {
  date: string;
  form: ReturnType<typeof useDailyReview>;
}

const DailyReviewModal: FC<Props> = ({ date, form }) => (
  <Modal
    open={form.open}
    onClose={form.closeReview}
    title={formatDayHeading(date)}
    className="max-w-3xl sm:max-h-[90vh]"
  >
    {form.isError ? (
      <p className="text-sm text-foreground">
        Could not load the review for this day. Try refreshing the page.
      </p>
    ) : (
      <DailyReviewForm form={form} onCancel={form.closeReview} />
    )}
  </Modal>
);

export default DailyReviewModal;
