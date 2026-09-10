"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { dailyReviewsModule, request } from "@/shared/endpoints";
import { isNotFoundError } from "@/shared/errors";
import type {
  CreateDailyReviewBody,
  DailyReview,
  DailyReviewListQuery,
  DailyReviewRangeQuery,
  RecordId,
  UpdateDailyReviewBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

const cacheReview = (queryClient: QueryClient, review: DailyReview) => {
  queryClient.setQueryData(queryKeys.dailyReviews.detail(review._id), review);
  queryClient.setQueryData(queryKeys.dailyReviews.byDate(review.date), review);
};

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
      queryFn: async () => {
        try {
          return await request(dailyReviewsModule.getByDate, {
            params: { date },
          });
        } catch (error) {
          if (isNotFoundError(error)) return null;
          throw error;
        }
      },
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
    onSuccess: (review) => {
      cacheReview(queryClient, review);
      invalidateDailyReviews();
    },
  });

  const updateDailyReviewMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: RecordId;
      body: UpdateDailyReviewBody;
    }) => request(dailyReviewsModule.update, { body, params: { id } }),
    onSuccess: (review) => {
      cacheReview(queryClient, review);
      invalidateDailyReviews();
    },
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
