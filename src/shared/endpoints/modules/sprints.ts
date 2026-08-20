import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateSprintBody,
  IdParam,
  PaginatedResponse,
  Sprint,
  SprintListQuery,
  UpdateSprintBody,
} from "@/shared/types";

export const sprintsModule = {
  create: defineEndpoint<Sprint, CreateSprintBody>({
    method: "POST",
    path: ROUTES.sprints.base,
    auth: true,
  }),

  list: defineEndpoint<PaginatedResponse<Sprint>, never, SprintListQuery>({
    method: "GET",
    path: ROUTES.sprints.base,
    auth: true,
  }),

  get: defineEndpoint<Sprint, never, never, IdParam>({
    method: "GET",
    path: ROUTES.sprints.byId,
    auth: true,
  }),

  update: defineEndpoint<Sprint, UpdateSprintBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.sprints.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.sprints.byId,
    auth: true,
  }),
} as const;

export type SprintsModule = typeof sprintsModule;
