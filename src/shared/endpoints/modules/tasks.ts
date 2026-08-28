import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  AssignToSprintBody,
  CreateTaskBody,
  IdParam,
  PaginatedResponse,
  SortDailyTasksBody,
  Task,
  TaskListQuery,
  UpdateTaskBody,
} from "@/shared/types";

export const tasksModule = {
  create: defineEndpoint<Task, CreateTaskBody>({
    method: "POST",
    path: ROUTES.tasks.base,
    auth: true,
  }),

  list: defineEndpoint<PaginatedResponse<Task>, never, TaskListQuery>({
    method: "GET",
    path: ROUTES.tasks.base,
    auth: true,
  }),

  get: defineEndpoint<Task, never, never, IdParam>({
    method: "GET",
    path: ROUTES.tasks.byId,
    auth: true,
  }),

  update: defineEndpoint<Task, UpdateTaskBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.tasks.byId,
    auth: true,
  }),

  assignToSprint: defineEndpoint<void, AssignToSprintBody>({
    method: "PUT",
    path: ROUTES.tasks.assignToSprint,
    auth: true,
  }),

  sortDailyTasks: defineEndpoint<void, SortDailyTasksBody>({
    method: "PUT",
    path: ROUTES.tasks.sort,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.tasks.byId,
    auth: true,
  }),
} as const;

export type TasksModule = typeof tasksModule;
