"use client";

import { useState } from "react";
import { useDailyReview } from "./useDailyReview";

export type FinishDayStep = 1 | 2;

export function useFinishDay(date: string) {
  const review = useDailyReview(date, { closeOnSave: false });
  const [step, setStep] = useState<FinishDayStep>(1);
  const [applyOpen, setApplyOpen] = useState(false);

  const openFinishDay = () => {
    review.openReview();
    setStep(1);
  };

  const closeFinishDay = () => {
    review.closeReview();
    setStep(1);
    setApplyOpen(false);
  };

  const goToStep2 = () => setStep(2);
  const backToStep1 = () => setStep(1);
  const openApply = () => setApplyOpen(true);
  const closeApply = () => setApplyOpen(false);

  return {
    ...review,
    step,
    applyOpen,
    openFinishDay,
    closeFinishDay,
    goToStep2,
    backToStep1,
    openApply,
    closeApply,
  };
}

export type FinishDayViewModel = ReturnType<typeof useFinishDay>;
