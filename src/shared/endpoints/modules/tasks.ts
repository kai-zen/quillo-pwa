import { ROUTES } from "../routes";
import type { EndpointDef } from "../types";
import type {
  CreateTaskBody,
  IdParam,
  PaginatedResponse,
  Task,
  TaskListQuery,
  UpdateTaskBody,
} from "@/shared/types";

export const tasksModule = {
  create: {
    method: "POST",
    path: ROUTES.tasks.base,
    auth: true,
  } satisfies EndpointDef<Task, CreateTaskBody>,

  list: {
    method: "GET",
    path: ROUTES.tasks.base,
    auth: true,
  } satisfies EndpointDef<PaginatedResponse<Task>, never, TaskListQuery>,

  get: {
    method: "GET",
    path: ROUTES.tasks.byId,
    auth: true,
  } satisfies EndpointDef<Task, never, never, IdParam>,

  update: {
    method: "PUT",
    path: ROUTES.tasks.byId,
    auth: true,
  } satisfies EndpointDef<Task, UpdateTaskBody, never, IdParam>,

  delete: {
    method: "DELETE",
    path: ROUTES.tasks.byId,
    auth: true,
  } satisfies EndpointDef<void, never, never, IdParam>,
} as const;

export type TasksModule = typeof tasksModule;
