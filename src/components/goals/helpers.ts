import type { Goal, GoalStatus, UpdateGoalBody } from "@/shared/types";
import { GOAL_STATUSES } from "@/shared/types";

export const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return "";
  return value.slice(0, 10);
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const GOAL_STATUS_BADGE_CLASS: Record<GoalStatus, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  completed:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export const GOAL_STATUS_DOT_CLASS: Record<GoalStatus, string> = {
  active: "bg-emerald-500",
  completed: "bg-neutral-400",
  cancelled: "bg-rose-500",
};

export const GOAL_STATUS_OPTIONS = GOAL_STATUSES;

export const goalHref = (id: string | Goal): string =>
  `/goals/${typeof id === "string" ? id : id._id}`;

export const formatGoalDate = (value: string): string => {
  const date = new Date(`${toDateInputValue(value)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return toDateInputValue(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatGoalRange = (
  start: string | null,
  target: string | null,
): string => {
  if (start && target) {
    return `${formatGoalDate(start)} – ${formatGoalDate(target)}`;
  }
  if (start) return `From ${formatGoalDate(start)}`;
  if (target) return `Target ${formatGoalDate(target)}`;
  return "No dates";
};

export const objectiveProgress = (goal: Goal): string => {
  const total = goal.objectives.length;
  if (total === 0) return "No objectives";
  const done = goal.objectives.filter((item) => item.completed).length;
  return `${done}/${total} objectives`;
};

export const toUpdateBody = (goal: Goal): UpdateGoalBody => ({
  title: goal.title,
  description: goal.description,
  status: goal.status,
  start_date: goal.start_date,
  target_date: goal.target_date,
  objectives: goal.objectives.map((objective) => ({
    _id: objective._id,
    title: objective.title,
    description: objective.description,
    completed: objective.completed,
  })),
});
