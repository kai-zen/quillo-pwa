import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateGoalBody,
  Goal,
  GoalDetail,
  GoalListQuery,
  GoalObjectiveParam,
  IdParam,
  PaginatedResponse,
  UpdateGoalBody,
} from "@/shared/types";

export const goalsModule = {
  create: defineEndpoint<Goal, CreateGoalBody>({
    method: "POST",
    path: ROUTES.goals.base,
    auth: true,
  }),

  list: defineEndpoint<PaginatedResponse<Goal>, never, GoalListQuery>({
    method: "GET",
    path: ROUTES.goals.base,
    auth: true,
  }),

  get: defineEndpoint<GoalDetail, never, never, IdParam>({
    method: "GET",
    path: ROUTES.goals.byId,
    auth: true,
  }),

  toggleObjective: defineEndpoint<Goal, never, never, GoalObjectiveParam>({
    method: "PATCH",
    path: ROUTES.goals.toggleObjective,
    auth: true,
  }),

  update: defineEndpoint<Goal, UpdateGoalBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.goals.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.goals.byId,
    auth: true,
  }),
} as const;

export type GoalsModule = typeof goalsModule;
