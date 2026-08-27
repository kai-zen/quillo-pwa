// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type RecordId = string;

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const TASK_PRIORITIES = [
  "unset",
  "low",
  "medium",
  "high",
  "urgent",
] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  "todo",
  "doing",
  "done",
  "paused",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const SPRINT_STATUSES = [
  "planned",
  "active",
  "completed",
  "archived",
] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export const ROUTINE_REPEATS = ["everyday", "weekly"] as const;
export type RoutineRepeat = (typeof ROUTINE_REPEATS)[number];

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export interface User extends Timestamps {
  _id: RecordId;
  username: string;
}

export interface Label extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  name: string;
  color: string;
}

export interface Sprint extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  sprint_number: number;
}

export interface RoutineDraft {
  title: string;
  priority: TaskPriority;
  description: string;
  label_ids: RecordId[];
}

export interface Routine extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  name: string;
  repeat: RoutineRepeat;
  days_of_week: DayOfWeek[];
  drafts: RoutineDraft[];
}

export interface Task extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  label_ids: RecordId[];
  sprint_id: RecordId | null;
  doing_date: string | null;
  parent_id: RecordId | null;
  task_number: number;
  children: Task[];
}

// ---------------------------------------------------------------------------
// Users — request bodies
// ---------------------------------------------------------------------------

export interface RegisterBody {
  username: string;
  password: string;
}

export interface LoginBody {
  username: string;
  password: string;
}

export interface ChangePasswordBody {
  current_password: string;
  new_password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ---------------------------------------------------------------------------
// Labels — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateLabelBody {
  name: string;
  color: string;
}

export type UpdateLabelBody = CreateLabelBody;

export type LabelListQuery = PaginationQuery;

// ---------------------------------------------------------------------------
// Sprints — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateSprintBody {
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  status?: SprintStatus;
}

export type UpdateSprintBody = CreateSprintBody;

export interface SprintListQuery extends PaginationQuery {
  status?: SprintStatus;
}

// ---------------------------------------------------------------------------
// Routines — request bodies & queries
// ---------------------------------------------------------------------------

export interface RoutineDraftBody {
  title: string;
  priority?: TaskPriority;
  description?: string;
  label_ids?: RecordId[];
}

export interface CreateRoutineBody {
  name: string;
  repeat?: RoutineRepeat;
  days_of_week?: DayOfWeek[];
  drafts?: RoutineDraftBody[];
}

export type UpdateRoutineBody = CreateRoutineBody;

export interface ApplyRoutinesBody {
  routine_ids: RecordId[];
  doing_date: string;
}

export interface ApplyRoutinesResponse {
  items: Task[];
}

export interface RoutineListQuery extends PaginationQuery {
  day?: DayOfWeek;
}

// ---------------------------------------------------------------------------
// Tasks — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateTaskBody {
  title: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  description?: string;
  label_ids?: RecordId[];
  sprint_id?: RecordId | null;
  doing_date?: string | null;
  parent_id?: RecordId | null;
}

export type UpdateTaskBody = CreateTaskBody;

export interface AssignToSprintBody {
  task_ids: RecordId[];
  sprint_id: RecordId;
}

export interface TaskListQuery extends PaginationQuery {
  doing_date?: string;
  sprint_id?: RecordId;
  parent_id?: RecordId;
  status?: TaskStatus;
  /** Comma-separated label ids */
  label_ids?: string;
}

// ---------------------------------------------------------------------------
// Shared path params
// ---------------------------------------------------------------------------

export interface IdParam {
  id: RecordId;
}
