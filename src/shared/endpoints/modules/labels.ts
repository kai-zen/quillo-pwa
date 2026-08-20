import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateLabelBody,
  IdParam,
  Label,
  LabelListQuery,
  PaginatedResponse,
  UpdateLabelBody,
} from "@/shared/types";

export const labelsModule = {
  create: defineEndpoint<Label, CreateLabelBody>({
    method: "POST",
    path: ROUTES.labels.base,
    auth: true,
  }),

  list: defineEndpoint<PaginatedResponse<Label>, never, LabelListQuery>({
    method: "GET",
    path: ROUTES.labels.base,
    auth: true,
  }),

  get: defineEndpoint<Label, never, never, IdParam>({
    method: "GET",
    path: ROUTES.labels.byId,
    auth: true,
  }),

  update: defineEndpoint<Label, UpdateLabelBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.labels.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.labels.byId,
    auth: true,
  }),
} as const;

export type LabelsModule = typeof labelsModule;
