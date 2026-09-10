import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateProgressBody,
  IdParam,
  PaginatedResponse,
  Progress,
  ProgressListQuery,
  UpdateProgressBody,
} from "@/shared/types";

export const progressesModule = {
  create: defineEndpoint<Progress, CreateProgressBody>({
    method: "POST",
    path: ROUTES.progresses.base,
    auth: true,
  }),

  list: defineEndpoint<PaginatedResponse<Progress>, never, ProgressListQuery>({
    method: "GET",
    path: ROUTES.progresses.base,
    auth: true,
  }),

  get: defineEndpoint<Progress, never, never, IdParam>({
    method: "GET",
    path: ROUTES.progresses.byId,
    auth: true,
  }),

  update: defineEndpoint<Progress, UpdateProgressBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.progresses.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.progresses.byId,
    auth: true,
  }),
} as const;

export type ProgressesModule = typeof progressesModule;
