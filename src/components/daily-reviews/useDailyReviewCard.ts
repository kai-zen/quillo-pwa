"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useDailyReviewsApi } from "@/shared/hooks";
import type { DailyReviewMood } from "@/shared/types";
import { isReviewableDate } from "./helpers";

export function useDailyReviewCard(date: string) {
  const {
    useDailyReviewByDate,
    createDailyReview,
    updateDailyReview,
    isCreating,
    isUpdating,
  } = useDailyReviewsApi();

  const reviewable = isReviewableDate(date);
  const query = useDailyReviewByDate(date, reviewable);
  const review = query.data ?? null;

  const [writing, setWriting] = useState(false);
  const [mood, setMood] = useState<DailyReviewMood | "">("");
  const [journal, setJournal] = useState("");
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating;
  const isEmpty = query.isSuccess && !review;

  const startWrite = () => {
    setMood(review?.mood ?? "");
    setJournal(review?.journal ?? "");
    setError("");
    setWriting(true);
  };

  const cancelWrite = () => {
    setWriting(false);
    setError("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    setError("");

    if (!mood) {
      setError("Pick a mood for this day.");
      return;
    }

    const body = {
      date,
      mood,
      journal: journal.trim(),
    };

    try {
      if (review) await updateDailyReview(review._id, body);
      else await createDailyReview(body);
      setWriting(false);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save this review."));
    }
  };

  return {
    reviewable,
    review,
    isLoading: query.isLoading,
    isError: query.isError,
    isEmpty,
    writing,
    mood,
    journal,
    error,
    pending,
    setMood,
    setJournal,
    startWrite,
    cancelWrite,
    onSubmit,
  };
}
