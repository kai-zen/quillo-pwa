import type { IdParam } from "@/shared/types";

/**
 * All API route paths. Dynamic segments use builder functions.
 */
export const ROUTES = {
  users: {
    register: "/users/register",
    login: "/users/login",
    me: "/users/me",
    changePassword: "/users/me/password",
    deleteMe: "/users/me",
  },

  labels: {
    base: "/labels",
    byId: ({ id }: IdParam) => `/labels/${id}`,
  },

  sprints: {
    base: "/sprints",
    byId: ({ id }: IdParam) => `/sprints/${id}`,
  },

  tasks: {
    base: "/tasks",
    byId: ({ id }: IdParam) => `/tasks/${id}`,
  },
} as const;

export type Routes = typeof ROUTES;
