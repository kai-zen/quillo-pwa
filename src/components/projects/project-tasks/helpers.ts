import type { RecordId, TaskListQuery, TaskPriority, TaskStatus } from "@/shared/types";
import { TASK_STATUSES } from "@/shared/types";

/** Page size for each status group. Keeps a 1000-task project to one screenful per page. */
export const PROJECT_TASK_PAGE_LIMIT = 25;

/** Active work. Done and cancelled stay out of this set so finished tasks don't bury the rest. */
export const OPEN_TASK_STATUSES: TaskStatus[] = ["doing", "todo", "paused"];

export type ProjectTaskFocus = "open" | TaskStatus;

export type ProjectTaskLayout = "list" | "board";

export const PROJECT_TASK_FOCUS_OPTIONS: ProjectTaskFocus[] = [
  "open",
  ...TASK_STATUSES,
];

export const visibleStatuses = (focus: ProjectTaskFocus): TaskStatus[] =>
  focus === "open" ? OPEN_TASK_STATUSES : [focus];

export interface ProjectTaskFilters {
  labelId: string;
  sprintId: string;
  priority: TaskPriority | "";
  search: string;
}

export const EMPTY_PROJECT_TASK_FILTERS: ProjectTaskFilters = {
  labelId: "",
  sprintId: "",
  priority: "",
  search: "",
};

export const hasProjectTaskFilters = (filters: ProjectTaskFilters): boolean =>
  Boolean(
    filters.labelId || filters.sprintId || filters.priority || filters.search,
  );

export const projectTaskQuery = (
  projectId: RecordId,
  status: TaskStatus,
  page: number,
  limit: number,
  filters: ProjectTaskFilters,
): TaskListQuery => ({
  project_id: projectId,
  status,
  page,
  limit,
  ...(filters.labelId ? { label_ids: filters.labelId } : {}),
  ...(filters.sprintId ? { sprint_id: filters.sprintId } : {}),
  ...(filters.priority ? { priority: filters.priority } : {}),
  ...(filters.search ? { q: filters.search } : {}),
});

export const formatTaskCount = (count: number): string =>
  count.toLocaleString();

export const pageRange = (
  page: number,
  limit: number,
  total: number,
): string => {
  if (total <= 0) return "0";
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()}`;
};
