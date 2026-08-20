import type {
  Label,
  RecordId,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskBody,
} from "@/shared/types";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/shared/types";

export const LABEL_COLORS = [
  "#525252",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
] as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
  paused: "Paused",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  unset: "Unset",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
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

  for (const task of tasks) {
    if (!task.parent_id || !ids.has(task.parent_id)) continue;
    const siblings = childrenByParent.get(task.parent_id) ?? [];
    siblings.push(task);
    childrenByParent.set(task.parent_id, siblings);
  }

  return tasks
    .filter((task) => !task.parent_id || !ids.has(task.parent_id))
    .map((task) => ({
      task,
      children: childrenByParent.get(task._id) ?? [],
    }));
};

export const labelsById = (labels: Label[]): Map<RecordId, Label> =>
  new Map(labels.map((label) => [label._id, label]));
