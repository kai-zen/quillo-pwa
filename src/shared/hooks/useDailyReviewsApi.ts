"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dailyReviewsModule, request } from "@/shared/endpoints";
import type {
  CreateDailyReviewBody,
  DailyReviewListQuery,
  DailyReviewRangeQuery,
  RecordId,
  UpdateDailyReviewBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useDailyReviewsApi = () => {
  const queryClient = useQueryClient();

  const invalidateDailyReviews = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.dailyReviews.all });

  const useDailyReviewsList = (query?: DailyReviewListQuery) =>
    useQuery({
      queryKey: queryKeys.dailyReviews.list(query),
      queryFn: () => request(dailyReviewsModule.list, { query }),
    });

  const useDailyReview = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.dailyReviews.detail(id),
      queryFn: () => request(dailyReviewsModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const useDailyReviewByDate = (date: string, enabled = true) =>
    useQuery({
      queryKey: queryKeys.dailyReviews.byDate(date),
      queryFn: () => request(dailyReviewsModule.getByDate, { params: { date } }),
      enabled: enabled && !!date,
    });

  const useDailyReviewsRange = (
    query: DailyReviewRangeQuery,
    enabled = true,
  ) =>
    useQuery({
      queryKey: queryKeys.dailyReviews.range(query),
      queryFn: () => request(dailyReviewsModule.getByRange, { query }),
      enabled: enabled && !!query.from && !!query.to,
    });

  const createDailyReviewMutation = useMutation({
    mutationFn: (body: CreateDailyReviewBody) =>
      request(dailyReviewsModule.create, { body }),
    onSuccess: invalidateDailyReviews,
  });

  const updateDailyReviewMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: RecordId;
      body: UpdateDailyReviewBody;
    }) => request(dailyReviewsModule.update, { body, params: { id } }),
    onSuccess: invalidateDailyReviews,
  });

  const deleteDailyReviewMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(dailyReviewsModule.delete, { params: { id } }),
    onSuccess: invalidateDailyReviews,
  });

  return {
    useDailyReviewsList,
    useDailyReview,
    useDailyReviewByDate,
    useDailyReviewsRange,
    createDailyReview: createDailyReviewMutation.mutateAsync,
    updateDailyReview: (id: RecordId, body: UpdateDailyReviewBody) =>
      updateDailyReviewMutation.mutateAsync({ id, body }),
    deleteDailyReview: deleteDailyReviewMutation.mutateAsync,
    isCreating: createDailyReviewMutation.isPending,
    isUpdating: updateDailyReviewMutation.isPending,
    isDeleting: deleteDailyReviewMutation.isPending,
  };
};
