import { ROUTES } from "../routes";
import type { EndpointDef } from "../types";
import type {
  CreateLabelBody,
  IdParam,
  Label,
  LabelListQuery,
  PaginatedResponse,
  UpdateLabelBody,
} from "@/shared/types";

export const labelsModule = {
  create: {
    method: "POST",
    path: ROUTES.labels.base,
    auth: true,
  } satisfies EndpointDef<Label, CreateLabelBody>,

  list: {
    method: "GET",
    path: ROUTES.labels.base,
    auth: true,
  } satisfies EndpointDef<PaginatedResponse<Label>, never, LabelListQuery>,

  get: {
    method: "GET",
    path: ROUTES.labels.byId,
    auth: true,
  } satisfies EndpointDef<Label, never, never, IdParam>,

  update: {
    method: "PUT",
    path: ROUTES.labels.byId,
    auth: true,
  } satisfies EndpointDef<Label, UpdateLabelBody, never, IdParam>,

  delete: {
    method: "DELETE",
    path: ROUTES.labels.byId,
    auth: true,
  } satisfies EndpointDef<void, never, never, IdParam>,
} as const;

export type LabelsModule = typeof labelsModule;
