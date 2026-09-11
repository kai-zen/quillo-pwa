"use client";

import { FC } from "react";
import FinishDayModal from "./finish-day-modal/FinishDayModal";
import type { FinishDayViewModel } from "./useFinishDay";

interface Props {
  date: string;
  view: FinishDayViewModel;
}

const DailyReview: FC<Props> = ({ date, view }) => {
  if (!view.reviewable) return null;

  return <FinishDayModal date={date} view={view} />;
};

export default DailyReview;
