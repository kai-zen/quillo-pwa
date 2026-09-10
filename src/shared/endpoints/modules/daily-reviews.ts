import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateDailyReviewBody,
  DailyReview,
  DailyReviewDateParam,
  DailyReviewListQuery,
  DailyReviewRangeQuery,
  DailyReviewRangeResponse,
  IdParam,
  PaginatedResponse,
  UpdateDailyReviewBody,
} from "@/shared/types";

export const dailyReviewsModule = {
  create: defineEndpoint<DailyReview, CreateDailyReviewBody>({
    method: "POST",
    path: ROUTES.dailyReviews.base,
    auth: true,
  }),

  list: defineEndpoint<
    PaginatedResponse<DailyReview>,
    never,
    DailyReviewListQuery
  >({
    method: "GET",
    path: ROUTES.dailyReviews.base,
    auth: true,
  }),

  getByRange: defineEndpoint<
    DailyReviewRangeResponse,
    never,
    DailyReviewRangeQuery
  >({
    method: "GET",
    path: ROUTES.dailyReviews.range,
    auth: true,
  }),

  getByDate: defineEndpoint<DailyReview, never, never, DailyReviewDateParam>({
    method: "GET",
    path: ROUTES.dailyReviews.byDate,
    auth: true,
  }),

  get: defineEndpoint<DailyReview, never, never, IdParam>({
    method: "GET",
    path: ROUTES.dailyReviews.byId,
    auth: true,
  }),

  update: defineEndpoint<DailyReview, UpdateDailyReviewBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.dailyReviews.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.dailyReviews.byId,
    auth: true,
  }),
} as const;

export type DailyReviewsModule = typeof dailyReviewsModule;
