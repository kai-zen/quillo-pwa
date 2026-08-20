import { ROUTES } from "../routes";
import type { EndpointDef } from "../types";
import type {
  CreateSprintBody,
  IdParam,
  PaginatedResponse,
  Sprint,
  SprintListQuery,
  UpdateSprintBody,
} from "@/shared/types";

export const sprintsModule = {
  create: {
    method: "POST",
    path: ROUTES.sprints.base,
    auth: true,
  } satisfies EndpointDef<Sprint, CreateSprintBody>,

  list: {
    method: "GET",
    path: ROUTES.sprints.base,
    auth: true,
  } satisfies EndpointDef<
    PaginatedResponse<Sprint>,
    never,
    SprintListQuery
  >,

  get: {
    method: "GET",
    path: ROUTES.sprints.byId,
    auth: true,
  } satisfies EndpointDef<Sprint, never, never, IdParam>,

  update: {
    method: "PUT",
    path: ROUTES.sprints.byId,
    auth: true,
  } satisfies EndpointDef<Sprint, UpdateSprintBody, never, IdParam>,

  delete: {
    method: "DELETE",
    path: ROUTES.sprints.byId,
    auth: true,
  } satisfies EndpointDef<void, never, never, IdParam>,
} as const;

export type SprintsModule = typeof sprintsModule;
