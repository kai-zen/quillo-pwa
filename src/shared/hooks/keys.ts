import type {
  GoalListQuery,
  LabelListQuery,
  RecordId,
  RoutineListQuery,
  SprintListQuery,
  TaskListQuery,
} from "@/shared/types";

export const queryKeys = {
  users: {
    all: ["users"] as const,
    me: ["users", "me"] as const,
  },
  labels: {
    all: ["labels"] as const,
    list: (query?: LabelListQuery) => ["labels", "list", query] as const,
    detail: (id: RecordId) => ["labels", "detail", id] as const,
  },
  goals: {
    all: ["goals"] as const,
    list: (query?: GoalListQuery) => ["goals", "list", query] as const,
    detail: (id: RecordId) => ["goals", "detail", id] as const,
  },
  sprints: {
    all: ["sprints"] as const,
    list: (query?: SprintListQuery) => ["sprints", "list", query] as const,
    detail: (id: RecordId) => ["sprints", "detail", id] as const,
  },
  routines: {
    all: ["routines"] as const,
    list: (query?: RoutineListQuery) => ["routines", "list", query] as const,
    detail: (id: RecordId) => ["routines", "detail", id] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (query?: TaskListQuery) => ["tasks", "list", query] as const,
    detail: (id: RecordId) => ["tasks", "detail", id] as const,
  },
};
