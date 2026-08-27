import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  ApplyRoutinesBody,
  ApplyRoutinesResponse,
  CreateRoutineBody,
  IdParam,
  PaginatedResponse,
  Routine,
  RoutineListQuery,
  UpdateRoutineBody,
} from "@/shared/types";

export const routinesModule = {
  create: defineEndpoint<Routine, CreateRoutineBody>({
    method: "POST",
    path: ROUTES.routines.base,
    auth: true,
  }),

  list: defineEndpoint<PaginatedResponse<Routine>, never, RoutineListQuery>({
    method: "GET",
    path: ROUTES.routines.base,
    auth: true,
  }),

  get: defineEndpoint<Routine, never, never, IdParam>({
    method: "GET",
    path: ROUTES.routines.byId,
    auth: true,
  }),

  update: defineEndpoint<Routine, UpdateRoutineBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.routines.byId,
    auth: true,
  }),

  apply: defineEndpoint<ApplyRoutinesResponse, ApplyRoutinesBody>({
    method: "POST",
    path: ROUTES.routines.apply,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.routines.byId,
    auth: true,
  }),
} as const;

export type RoutinesModule = typeof routinesModule;
