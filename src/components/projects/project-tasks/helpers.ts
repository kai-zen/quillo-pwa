import type {
  RecordId,
  Task,
  TaskListQuery,
  TaskPriority,
  TaskStatus,
} from "@/shared/types";
import { TASK_STATUSES } from "@/shared/types";

/** Page size for each status group. Keeps a 1000-task project to one screenful per page. */
export const PROJECT_TASK_PAGE_LIMIT = 25;

/** Active work. Done and cancelled stay out of this set so finished tasks don't bury the rest. */
export const OPEN_TASK_STATUSES: TaskStatus[] = ["doing", "todo", "paused"];

/** Every status column on the project board, left to right. */
export const BOARD_STATUSES: TaskStatus[] = [
  "todo",
  "doing",
  "paused",
  "done",
  "cancelled",
];

export type ProjectTaskFocus = "open" | TaskStatus;

export type ProjectTaskLayout = "list" | "board" | "start";

/** Story points at or below this count count as a small task. */
export const START_LIGHT_MAX_POINTS = 3;

const IMPORTANT_PRIORITIES = new Set<TaskPriority>(["urgent", "high"]);

const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  unset: 4,
};

export type StartQuadrantId = "now" | "plan" | "easy" | "later";

export interface RankedStartTask {
  task: Task;
  rank: number;
}

export interface StartQuadrant {
  id: StartQuadrantId;
  title: string;
  description: string;
  tasks: RankedStartTask[];
}

export const START_QUADRANTS: Array<
  Pick<StartQuadrant, "id" | "title" | "description">
> = [
  {
    id: "now",
    title: "Start now",
    description: "Urgent or high priority, 3 points or fewer",
  },
  {
    id: "plan",
    title: "Plan next",
    description: "Urgent or high priority, larger or not estimated",
  },
  {
    id: "easy",
    title: "Easy extras",
    description: "Medium, low, or unset priority, 3 points or fewer",
  },
  {
    id: "later",
    title: "Later",
    description: "Medium, low, or unset priority, larger or not estimated",
  },
];

const isLightTask = (task: Task): boolean =>
  task.story_points != null && task.story_points <= START_LIGHT_MAX_POINTS;

const quadrantIdFor = (task: Task): StartQuadrantId => {
  const important = IMPORTANT_PRIORITIES.has(task.priority);
  const light = isLightTask(task);
  if (important && light) return "now";
  if (important) return "plan";
  if (light) return "easy";
  return "later";
};

const compareStartOrder = (a: Task, b: Task): number => {
  const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (byPriority !== 0) return byPriority;
  const aPoints = a.story_points ?? 1000;
  const bPoints = b.story_points ?? 1000;
  if (aPoints !== bPoints) return aPoints - bPoints;
  return a.task_number - b.task_number;
};

const matchesStartFilters = (task: Task, filters: ProjectTaskFilters): boolean => {
  if (task.status !== "todo") return false;
  if (filters.priority && task.priority !== filters.priority) return false;
  if (filters.labelId && !task.label_ids.includes(filters.labelId)) return false;
  if (filters.sprintId === "null") {
    if (task.sprint_id) return false;
  } else if (filters.sprintId && task.sprint_id !== filters.sprintId) {
    return false;
  }
  const search = filters.search.trim().toLowerCase();
  if (!search) return true;
  if (task.title.toLowerCase().includes(search)) return true;
  if (task.description.toLowerCase().includes(search)) return true;
  const numberMatch = search.match(/^#?(\d+)$/);
  return !!numberMatch && task.task_number === Number(numberMatch[1]);
};

export const buildStartQuadrants = (
  tasks: Task[],
  filters: ProjectTaskFilters,
): StartQuadrant[] => {
  const grouped: Record<StartQuadrantId, Task[]> = {
    now: [],
    plan: [],
    easy: [],
    later: [],
  };

  for (const task of tasks) {
    if (!matchesStartFilters(task, filters)) continue;
    grouped[quadrantIdFor(task)].push(task);
  }

  let rank = 1;
  return START_QUADRANTS.map((quadrant) => ({
    ...quadrant,
    tasks: grouped[quadrant.id].sort(compareStartOrder).map((task) => ({
      task,
      rank: rank++,
    })),
  }));
};

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
