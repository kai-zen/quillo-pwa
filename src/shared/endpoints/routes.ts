import type {
  DailyReviewDateParam,
  GoalObjectiveParam,
  IdParam,
} from "@/shared/types";

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
    deleteMyData: "/users/me/data",
  },

  labels: {
    base: "/labels",
    byId: ({ id }: IdParam) => `/labels/${id}`,
  },

  projects: {
    base: "/projects",
    byId: ({ id }: IdParam) => `/projects/${id}`,
  },

  goals: {
    base: "/goals",
    byId: ({ id }: IdParam) => `/goals/${id}`,
    toggleObjective: ({ id, objectiveId }: GoalObjectiveParam) =>
      `/goals/${id}/objectives/${objectiveId}/toggle`,
  },

  sprints: {
    base: "/sprints",
    byId: ({ id }: IdParam) => `/sprints/${id}`,
  },

  routines: {
    base: "/routines",
    byId: ({ id }: IdParam) => `/routines/${id}`,
    apply: "/routines/apply",
  },

  tasks: {
    base: "/tasks",
    byId: ({ id }: IdParam) => `/tasks/${id}`,
    assignToSprint: "/tasks/sprint",
    sort: "/tasks/sort",
  },

  noteFolders: {
    base: "/note-folders",
    byId: ({ id }: IdParam) => `/note-folders/${id}`,
  },

  notes: {
    base: "/notes",
    byId: ({ id }: IdParam) => `/notes/${id}`,
    togglePinned: ({ id }: IdParam) => `/notes/${id}/pinned/toggle`,
    toggleArchived: ({ id }: IdParam) => `/notes/${id}/archived/toggle`,
  },

  dailyReviews: {
    base: "/daily-reviews",
    byId: ({ id }: IdParam) => `/daily-reviews/${id}`,
    range: "/daily-reviews/range",
    byDate: ({ date }: DailyReviewDateParam) => `/daily-reviews/date/${date}`,
  },

  dailySections: {
    base: "/daily-sections",
    byId: ({ id }: IdParam) => `/daily-sections/${id}`,
    byDate: ({ date }: DailyReviewDateParam) => `/daily-sections/date/${date}`,
    sort: "/daily-sections/sort",
  },

  sectionTemplates: {
    base: "/section-templates",
    byId: ({ id }: IdParam) => `/section-templates/${id}`,
    apply: ({ id }: IdParam) => `/section-templates/${id}/apply`,
  },

  progresses: {
    base: "/progresses",
    byId: ({ id }: IdParam) => `/progresses/${id}`,
  },

  progressInputs: {
    base: "/progress-inputs",
    byId: ({ id }: IdParam) => `/progress-inputs/${id}`,
    range: "/progress-inputs/range",
    byDate: ({ date }: DailyReviewDateParam) => `/progress-inputs/date/${date}`,
  },
} as const;

export type Routes = typeof ROUTES;
