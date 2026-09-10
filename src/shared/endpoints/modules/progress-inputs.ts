import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateProgressInputBody,
  DailyReviewDateParam,
  IdParam,
  PaginatedResponse,
  ProgressInput,
  ProgressInputItemsResponse,
  ProgressInputListQuery,
  ProgressInputRangeQuery,
  UpdateProgressInputBody,
} from "@/shared/types";

export const progressInputsModule = {
  create: defineEndpoint<ProgressInput, CreateProgressInputBody>({
    method: "POST",
    path: ROUTES.progressInputs.base,
    auth: true,
  }),

  list: defineEndpoint<
    PaginatedResponse<ProgressInput>,
    never,
    ProgressInputListQuery
  >({
    method: "GET",
    path: ROUTES.progressInputs.base,
    auth: true,
  }),

  getByRange: defineEndpoint<
    ProgressInputItemsResponse,
    never,
    ProgressInputRangeQuery
  >({
    method: "GET",
    path: ROUTES.progressInputs.range,
    auth: true,
  }),

  getByDate: defineEndpoint<
    ProgressInputItemsResponse,
    never,
    never,
    DailyReviewDateParam
  >({
    method: "GET",
    path: ROUTES.progressInputs.byDate,
    auth: true,
  }),

  get: defineEndpoint<ProgressInput, never, never, IdParam>({
    method: "GET",
    path: ROUTES.progressInputs.byId,
    auth: true,
  }),

  update: defineEndpoint<
    ProgressInput,
    UpdateProgressInputBody,
    never,
    IdParam
  >({
    method: "PUT",
    path: ROUTES.progressInputs.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.progressInputs.byId,
    auth: true,
  }),
} as const;

export type ProgressInputsModule = typeof progressInputsModule;
