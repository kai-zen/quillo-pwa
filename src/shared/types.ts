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

export const TASK_STORY_POINTS = [1, 2, 3, 5, 8, 13, 21] as const;
export type TaskStoryPoints = (typeof TASK_STORY_POINTS)[number];

export const SPRINT_STATUSES = [
  "planned",
  "active",
  "completed",
  "archived",
] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export const GOAL_STATUSES = ["active", "completed", "cancelled"] as const;
export type GoalStatus = (typeof GOAL_STATUSES)[number];

export const PROJECT_STATUSES = ["active", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

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

export const PROGRESS_INPUT_TYPES = [
  "boolean",
  "number",
  "duration",
  "rating",
  "choice",
] as const;
export type ProgressInputType = (typeof PROGRESS_INPUT_TYPES)[number];

export const DAILY_REVIEW_MOODS = [
  "awful",
  "bad",
  "sad",
  "angry",
  "anxious",
  "overwhelmed",
  "frustrated",
  "tired",
  "lonely",
  "bored",
  "okay",
  "restless",
  "calm",
  "good",
  "happy",
  "grateful",
  "proud",
  "hopeful",
  "excited",
  "great",
] as const;
export type DailyReviewMood = (typeof DAILY_REVIEW_MOODS)[number];

export const USER_DATA_DELETE_TYPES = [
  "daily_tasks",
  "daily_sections",
  "daily_notes",
  "progress_inputs",
  "daily_reviews",
] as const;
export type UserDataDeleteType = (typeof USER_DATA_DELETE_TYPES)[number];

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

export interface Project extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  name: string;
  description: string;
  status: ProjectStatus;
  color: string;
}

export interface GoalObjective {
  _id: RecordId;
  title: string;
  description: string;
  completed: boolean;
}

export interface Goal extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  title: string;
  description: string;
  status: GoalStatus;
  start_date: string | null;
  target_date: string | null;
  objectives: GoalObjective[];
}

export interface GoalDetail extends Goal {
  sprints: Sprint[];
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
  goal_id: RecordId | null;
  progress_ids: RecordId[];
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
  project_id: Project | RecordId | null;
  doing_date: string | null;
  parent_id: RecordId | null;
  task_number: number;
  children: Task[];
  sort_order: number;
  story_points: TaskStoryPoints | null;
}

export interface NoteFolder extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  name: string;
}

export interface Note extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  title: string;
  content: string;
  folder_id: RecordId | null;
  label_ids: RecordId[];
  goal_id: RecordId | null;
  sprint_id: RecordId | null;
  project_id: RecordId | null;
  date: string | null;
  pinned: boolean;
  archived: boolean;
}

export interface DailyReview extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  date: string;
  journal: string;
  mood: DailyReviewMood;
  completion: number;
}

export interface Progress extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  title: string;
  description: string;
  input_type: ProgressInputType;
  choice_options?: string[];
  number_range?: [number, number];
}

export interface ProgressInput extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  progress_id: RecordId;
  date: string;
  value: boolean | number | string;
}

export interface DailySection extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  date: string;
  title: string;
  sort_order: number;
}

export interface SectionTemplateSection {
  title: string;
  sort_order: number;
}

export interface SectionTemplate extends Timestamps {
  _id: RecordId;
  user_id: RecordId;
  name: string;
  sections: SectionTemplateSection[];
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

export interface DeleteUserDataBody {
  types: UserDataDeleteType[];
}

export interface DeleteUserDataResponse {
  deleted: Partial<Record<UserDataDeleteType, number>>;
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
// Projects — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateProjectBody {
  name: string;
  description?: string;
  status?: ProjectStatus;
  color: string;
}

export type UpdateProjectBody = CreateProjectBody;

export interface ProjectListQuery extends PaginationQuery {
  status?: ProjectStatus;
}

// ---------------------------------------------------------------------------
// Goals — request bodies & queries
// ---------------------------------------------------------------------------

export interface GoalObjectiveBody {
  _id?: RecordId;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface CreateGoalBody {
  title: string;
  description?: string;
  status?: GoalStatus;
  start_date?: string | null;
  target_date?: string | null;
  objectives?: GoalObjectiveBody[];
}

export type UpdateGoalBody = CreateGoalBody;

export interface GoalListQuery extends PaginationQuery {
  status?: GoalStatus;
}

// ---------------------------------------------------------------------------
// Sprints — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateSprintBody {
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  status?: SprintStatus;
  goal_id?: RecordId | null;
  progress_ids?: RecordId[];
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
  project_id?: RecordId | null;
  doing_date?: string | null;
  parent_id?: RecordId | null;
  story_points?: TaskStoryPoints | null;
}

export type UpdateTaskBody = CreateTaskBody;

export interface AssignToSprintBody {
  task_ids: RecordId[];
  sprint_id: RecordId;
}

export interface SortDailyTasksBody {
  items: { id: RecordId; sort_order: number }[];
}

export interface TaskListQuery extends PaginationQuery {
  doing_date?: string;
  sprint_id?: RecordId;
  project_id?: RecordId;
  parent_id?: RecordId;
  status?: TaskStatus;
  priority?: TaskPriority;
  /** Case-insensitive match on title or description. A number also matches task_number. */
  q?: string;
  /** Comma-separated label ids */
  label_ids?: string;
}

// ---------------------------------------------------------------------------
// Note folders — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateNoteFolderBody {
  name: string;
}

export type UpdateNoteFolderBody = CreateNoteFolderBody;

export type NoteFolderListQuery = PaginationQuery;

// ---------------------------------------------------------------------------
// Notes — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateNoteBody {
  title: string;
  content?: string;
  folder_id?: RecordId | null;
  label_ids?: RecordId[];
  goal_id?: RecordId | null;
  sprint_id?: RecordId | null;
  project_id?: RecordId | null;
  date?: string | null;
  pinned?: boolean;
  archived?: boolean;
}

export type UpdateNoteBody = CreateNoteBody;

export interface NoteListQuery extends PaginationQuery {
  folder_id?: RecordId;
  goal_id?: RecordId;
  sprint_id?: RecordId;
  project_id?: RecordId;
  date?: string;
  archived?: boolean;
  pinned?: boolean;
  /** Comma-separated label ids */
  label_ids?: string;
}

// ---------------------------------------------------------------------------
// Daily reviews — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateDailyReviewBody {
  date: string;
  journal?: string;
  mood?: DailyReviewMood;
  completion?: number;
}

export type UpdateDailyReviewBody = CreateDailyReviewBody;

export interface DailyReviewListQuery extends PaginationQuery {
  date?: string;
  mood?: DailyReviewMood;
}

export interface DailyReviewRangeQuery {
  from: string;
  to: string;
}

export interface DailyReviewRangeResponse {
  items: DailyReview[];
}

// ---------------------------------------------------------------------------
// Daily sections — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateDailySectionBody {
  date: string;
  title?: string;
  sort_order?: number;
}

export interface UpdateDailySectionBody {
  title: string;
  sort_order: number;
}

export interface ReorderDailySectionsBody {
  items: { id: RecordId; sort_order: number }[];
}

export interface ReorderDailySectionsResponse {
  updated: number;
}

export interface DailySectionItemsResponse {
  items: DailySection[];
}

// ---------------------------------------------------------------------------
// Section templates — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateSectionTemplateSectionBody {
  title?: string;
  sort_order?: number;
}

export interface SectionTemplateSectionBody {
  title: string;
  sort_order: number;
}

export interface CreateSectionTemplateBody {
  name: string;
  sections?: CreateSectionTemplateSectionBody[];
}

export interface UpdateSectionTemplateBody {
  name: string;
  sections: SectionTemplateSectionBody[];
}

export interface ApplySectionTemplateBody {
  date: string;
}

export interface ApplySectionTemplateResponse {
  items: DailySection[];
}

export type SectionTemplateListQuery = PaginationQuery;

// ---------------------------------------------------------------------------
// Progresses — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateProgressBody {
  title: string;
  description?: string;
  input_type: ProgressInputType;
  choice_options?: string[];
  number_range?: [number, number];
}

export type UpdateProgressBody = CreateProgressBody;

export type ProgressListQuery = PaginationQuery;

// ---------------------------------------------------------------------------
// Progress inputs — request bodies & queries
// ---------------------------------------------------------------------------

export interface CreateProgressInputBody {
  progress_id: RecordId;
  date: string;
  value: boolean | number | string;
}

export type UpdateProgressInputBody = CreateProgressInputBody;

export interface ProgressInputListQuery extends PaginationQuery {
  progress_id?: RecordId;
  date?: string;
}

export interface ProgressInputRangeQuery {
  from: string;
  to: string;
  progress_id?: RecordId;
}

export interface ProgressInputItemsResponse {
  items: ProgressInput[];
}

// ---------------------------------------------------------------------------
// Shared path params
// ---------------------------------------------------------------------------

export interface IdParam {
  id: RecordId;
}

export interface GoalObjectiveParam {
  id: RecordId;
  objectiveId: RecordId;
}

export interface DailyReviewDateParam {
  date: string;
}
