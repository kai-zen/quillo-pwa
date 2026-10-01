import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateDailySectionBody,
  DailyReviewDateParam,
  DailySection,
  DailySectionItemsResponse,
  IdParam,
  ReorderDailySectionsBody,
  ReorderDailySectionsResponse,
  UpdateDailySectionBody,
} from "@/shared/types";

export const dailySectionsModule = {
  create: defineEndpoint<DailySection, CreateDailySectionBody>({
    method: "POST",
    path: ROUTES.dailySections.base,
    auth: true,
  }),

  listByDate: defineEndpoint<
    DailySectionItemsResponse,
    never,
    never,
    DailyReviewDateParam
  >({
    method: "GET",
    path: ROUTES.dailySections.byDate,
    auth: true,
  }),

  get: defineEndpoint<DailySection, never, never, IdParam>({
    method: "GET",
    path: ROUTES.dailySections.byId,
    auth: true,
  }),

  update: defineEndpoint<DailySection, UpdateDailySectionBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.dailySections.byId,
    auth: true,
  }),

  reorder: defineEndpoint<
    ReorderDailySectionsResponse,
    ReorderDailySectionsBody
  >({
    method: "PUT",
    path: ROUTES.dailySections.sort,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.dailySections.byId,
    auth: true,
  }),
} as const;

export type DailySectionsModule = typeof dailySectionsModule;
