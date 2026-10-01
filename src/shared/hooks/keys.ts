import type {
  DailyReviewListQuery,
  DailyReviewRangeQuery,
  GoalListQuery,
  LabelListQuery,
  NoteFolderListQuery,
  NoteListQuery,
  ProjectListQuery,
  ProgressInputListQuery,
  ProgressInputRangeQuery,
  ProgressListQuery,
  RecordId,
  RoutineListQuery,
  SprintListQuery,
  SectionTemplateListQuery,
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
  projects: {
    all: ["projects"] as const,
    list: (query?: ProjectListQuery) => ["projects", "list", query] as const,
    detail: (id: RecordId) => ["projects", "detail", id] as const,
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
  noteFolders: {
    all: ["noteFolders"] as const,
    list: (query?: NoteFolderListQuery) =>
      ["noteFolders", "list", query] as const,
    detail: (id: RecordId) => ["noteFolders", "detail", id] as const,
  },
  notes: {
    all: ["notes"] as const,
    list: (query?: NoteListQuery) => ["notes", "list", query] as const,
    detail: (id: RecordId) => ["notes", "detail", id] as const,
  },
  progresses: {
    all: ["progresses"] as const,
    list: (query?: ProgressListQuery) => ["progresses", "list", query] as const,
    detail: (id: RecordId) => ["progresses", "detail", id] as const,
  },
  progressInputs: {
    all: ["progressInputs"] as const,
    list: (query?: ProgressInputListQuery) =>
      ["progressInputs", "list", query] as const,
    detail: (id: RecordId) => ["progressInputs", "detail", id] as const,
    byDate: (date: string) => ["progressInputs", "date", date] as const,
    range: (query?: ProgressInputRangeQuery) =>
      ["progressInputs", "range", query] as const,
  },
  dailyReviews: {
    all: ["dailyReviews"] as const,
    list: (query?: DailyReviewListQuery) =>
      ["dailyReviews", "list", query] as const,
    detail: (id: RecordId) => ["dailyReviews", "detail", id] as const,
    byDate: (date: string) => ["dailyReviews", "date", date] as const,
    range: (query?: DailyReviewRangeQuery) =>
      ["dailyReviews", "range", query] as const,
  },
  dailySections: {
    all: ["dailySections"] as const,
    byDate: (date: string) => ["dailySections", "date", date] as const,
    detail: (id: RecordId) => ["dailySections", "detail", id] as const,
  },
  sectionTemplates: {
    all: ["sectionTemplates"] as const,
    list: (query?: SectionTemplateListQuery) =>
      ["sectionTemplates", "list", query] as const,
    detail: (id: RecordId) => ["sectionTemplates", "detail", id] as const,
  },
};
