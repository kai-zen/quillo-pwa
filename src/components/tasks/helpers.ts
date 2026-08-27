import type {
  Label,
  RecordId,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskBody,
} from "@/shared/types";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/shared/types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
  paused: "Paused",
  cancelled: "Cancelled",
};

export const STATUS_BADGE_CLASS: Record<TaskStatus, string> = {
  todo: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  doing: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export const STATUS_DOT_CLASS: Record<TaskStatus, string> = {
  todo: "bg-neutral-400",
  doing: "bg-sky-500",
  done: "bg-emerald-500",
  paused: "bg-amber-500",
  cancelled: "bg-rose-500",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  unset: "Unset",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  unset:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300",
  urgent: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export const STATUS_OPTIONS = TASK_STATUSES;
export const PRIORITY_OPTIONS = TASK_PRIORITIES;

export const toUpdateBody = (task: Task): UpdateTaskBody => ({
  title: task.title,
  priority: task.priority,
  status: task.status,
  description: task.description,
  label_ids: task.label_ids,
  sprint_id: task.sprint_id,
  doing_date: task.doing_date,
  parent_id: task.parent_id,
});

export const toDateInputValue = (value: string | null): string => {
  if (!value) return "";
  return value.slice(0, 10);
};

export interface TaskGroup {
  task: Task;
  children: Task[];
}

export const groupTasks = (tasks: Task[]): TaskGroup[] => {
  const ids = new Set(tasks.map((task) => task._id));
  const childrenByParent = new Map<RecordId, Task[]>();

  const addChild = (parentId: RecordId, child: Task) => {
    const siblings = childrenByParent.get(parentId) ?? [];
    if (siblings.some((item) => item._id === child._id)) return;
    siblings.push(child);
    childrenByParent.set(parentId, siblings);
  };

  for (const task of tasks) {
    if (task.parent_id && ids.has(task.parent_id)) {
      addChild(task.parent_id, task);
    }
    for (const child of task.children ?? []) {
      addChild(task._id, child);
    }
  }

  return tasks
    .filter((task) => !task.parent_id || !ids.has(task.parent_id))
    .map((task) => ({
      task,
      children: childrenByParent.get(task._id) ?? [],
    }));
};

export const compareDoneLast = (a: Task, b: Task) =>
  Number(a.status === "done") - Number(b.status === "done");

export const labelsById = (labels: Label[]): Map<RecordId, Label> =>
  new Map(labels.map((label) => [label._id, label]));

/** Days shown before / after today in the home day strip. */
export const DAY_STRIP_PAST = 14;
export const DAY_STRIP_FUTURE = 14;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayIso = (): string => toIsoDate(new Date());

export const parseIsoDate = (value: string): Date | null => {
  if (!ISO_DATE.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

export const addDays = (iso: string, amount: number): string => {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  date.setDate(date.getDate() + amount);
  return toIsoDate(date);
};

export const buildDayStrip = (
  centerIso: string,
  past = DAY_STRIP_PAST,
  future = DAY_STRIP_FUTURE,
): string[] => {
  const days: string[] = [];
  for (let offset = -past; offset <= future; offset += 1) {
    days.push(addDays(centerIso, offset));
  }
  return days;
};

export const formatDayHeading = (iso: string): string => {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDayChipWeekday = (iso: string): string => {
  const date = parseIsoDate(iso);
  if (!date) return "";
  return date.toLocaleDateString(undefined, { weekday: "short" });
};

export const formatDayChipDay = (iso: string): string => {
  const date = parseIsoDate(iso);
  if (!date) return "";
  return String(date.getDate());
};

export const formatDayChipMonth = (iso: string): string => {
  const date = parseIsoDate(iso);
  if (!date) return "";
  return date.toLocaleDateString(undefined, { month: "short" });
};
