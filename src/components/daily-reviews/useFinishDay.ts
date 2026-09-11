"use client";

import { useState } from "react";
import type { AddDayTasksSource } from "@/components/tasks/add-day-tasks";
import { useDailyReview } from "./useDailyReview";

export type FinishDayStep = 1 | 2;

export function useFinishDay(date: string) {
  const review = useDailyReview(date, { closeOnSave: false });
  const [step, setStep] = useState<FinishDayStep>(1);
  const [addPanel, setAddPanel] = useState<AddDayTasksSource>("none");
  const [createOpen, setCreateOpen] = useState(false);

  const openFinishDay = () => {
    review.openReview();
    setStep(1);
  };

  const closeFinishDay = () => {
    review.closeReview();
    setStep(1);
    setAddPanel("none");
    setCreateOpen(false);
  };

  const goToStep2 = () => setStep(2);
  const backToStep1 = () => setStep(1);
  const openAddPanel = (panel: Exclude<AddDayTasksSource, "none">) =>
    setAddPanel(panel);
  const closeAddPanel = () => setAddPanel("none");
  const openCreateTask = () => setCreateOpen(true);
  const closeCreateTask = () => setCreateOpen(false);

  return {
    ...review,
    step,
    addPanel,
    createOpen,
    openFinishDay,
    closeFinishDay,
    goToStep2,
    backToStep1,
    openAddPanel,
    closeAddPanel,
    openCreateTask,
    closeCreateTask,
  };
}

export type FinishDayViewModel = ReturnType<typeof useFinishDay>;
