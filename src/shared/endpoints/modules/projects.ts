import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateProjectBody,
  IdParam,
  PaginatedResponse,
  Project,
  ProjectListQuery,
  UpdateProjectBody,
} from "@/shared/types";

export const projectsModule = {
  create: defineEndpoint<Project, CreateProjectBody>({
    method: "POST",
    path: ROUTES.projects.base,
    auth: true,
  }),

  list: defineEndpoint<PaginatedResponse<Project>, never, ProjectListQuery>({
    method: "GET",
    path: ROUTES.projects.base,
    auth: true,
  }),

  get: defineEndpoint<Project, never, never, IdParam>({
    method: "GET",
    path: ROUTES.projects.byId,
    auth: true,
  }),

  update: defineEndpoint<Project, UpdateProjectBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.projects.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.projects.byId,
    auth: true,
  }),
} as const;

export type ProjectsModule = typeof projectsModule;
