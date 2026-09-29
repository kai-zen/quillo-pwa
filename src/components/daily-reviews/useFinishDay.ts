"use client";

import { useEffect, useMemo, useState } from "react";
import { findProgresses, pickActiveSprint } from "@/components/sprints/helpers";
import type { AddDayTasksSource } from "@/components/tasks/add-day-tasks";
import { todayIso } from "@/components/tasks/helpers";
import { useProgressesApi, useSprintsApi } from "@/shared/hooks";
import useDailyReview from "./useDailyReview";

export type FinishDayStep = 1 | 2 | 3;
export type FinishDayReviewTab = "reflect" | "progress";

const useFinishDay = (date: string) => {
  const review = useDailyReview(date, { closeOnSave: false });
  // Locked when the modal opens so saving the first step does not flip into view mode.
  const [createFlow, setCreateFlow] = useState(false);
  const isCreating = createFlow;
  const hasPlanStep = isCreating && date === todayIso();
  const { useSprintsList } = useSprintsApi();
  const { useProgressesList } = useProgressesApi();
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const progressesQuery = useProgressesList({ page: 1, limit: 100 });

  const activeSprint = useMemo(
    () => pickActiveSprint(sprintsQuery.data?.items ?? []),
    [sprintsQuery.data?.items],
  );
  const sprintProgresses = useMemo(
    () =>
      findProgresses(
        activeSprint?.progress_ids,
        progressesQuery.data?.items ?? [],
      ),
    [activeSprint?.progress_ids, progressesQuery.data?.items],
  );
  const hasProgressStep = sprintProgresses.length > 0;
  const planStep: FinishDayStep = hasProgressStep ? 3 : 2;
  const lastStep: FinishDayStep = hasPlanStep
    ? planStep
    : hasProgressStep
      ? 2
      : 1;

  const [step, setStep] = useState<FinishDayStep>(1);
  const [reviewTab, setReviewTab] = useState<FinishDayReviewTab>("reflect");
  const [reviewEditing, setReviewEditing] =
    useState<FinishDayReviewTab | null>(null);
  const [addPanel, setAddPanel] = useState<AddDayTasksSource>("none");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setCreateFlow(false);
  }, [date]);

  const openFinishDay = () => {
    setCreateFlow(!review.filled);
    review.openReview();
    setStep(1);
    setReviewTab("reflect");
    setReviewEditing(null);
  };

  const closeFinishDay = () => {
    review.closeReview();
    setCreateFlow(false);
    setStep(1);
    setReviewTab("reflect");
    setReviewEditing(null);
    setAddPanel("none");
    setCreateOpen(false);
  };

  const startReviewEdit = (tab: FinishDayReviewTab) => setReviewEditing(tab);

  const finishReviewEdit = () => setReviewEditing(null);

  const cancelReviewEdit = (tab: FinishDayReviewTab) => {
    if (tab === "reflect") review.resetDraft();
    setReviewEditing(null);
  };

  const advanceFromReflect = () => {
    if (hasProgressStep) setStep(2);
    else if (hasPlanStep) setStep(planStep);
    else closeFinishDay();
  };

  const advanceFromProgress = () => {
    if (hasPlanStep) setStep(planStep);
    else closeFinishDay();
  };

  const backToReflect = () => setStep(1);
  const backFromPlan = () => setStep(hasProgressStep ? 2 : 1);
  const openAddPanel = (panel: Exclude<AddDayTasksSource, "none">) =>
    setAddPanel(panel);
  const closeAddPanel = () => setAddPanel("none");
  const openCreateTask = () => setCreateOpen(true);
  const closeCreateTask = () => setCreateOpen(false);

  return {
    ...review,
    isCreating,
    hasPlanStep,
    lastStep,
    step,
    reviewTab,
    setReviewTab,
    reviewEditing,
    startReviewEdit,
    finishReviewEdit,
    cancelReviewEdit,
    planStep,
    hasProgressStep,
    activeSprint,
    sprintProgresses,
    isProgressCatalogLoading:
      !!activeSprint?.progress_ids?.length && progressesQuery.isLoading,
    addPanel,
    createOpen,
    openFinishDay,
    closeFinishDay,
    advanceFromReflect,
    advanceFromProgress,
    backToReflect,
    backFromPlan,
    openAddPanel,
    closeAddPanel,
    openCreateTask,
    closeCreateTask,
  };
};

export type FinishDayViewModel = ReturnType<typeof useFinishDay>;

export default useFinishDay;
