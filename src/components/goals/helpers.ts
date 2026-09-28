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

const toLocalDateIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const goalDayDiff = (from: string, to: string): number | null => {
  const start = new Date(`${toDateInputValue(from)}T00:00:00`);
  const end = new Date(`${toDateInputValue(to)}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
};

export const goalDurationDays = (
  start: string | null,
  target: string | null,
): number | null => {
  if (!start || !target) return null;
  const diff = goalDayDiff(start, target);
  if (diff === null || diff < 0) return null;
  return diff + 1;
};

export const goalDaysPassed = (
  start: string | null,
  target: string | null,
  from = new Date(),
): number | null => {
  const length = goalDurationDays(start, target);
  if (!length || !start || !target) return null;

  const startKey = toDateInputValue(start);
  const targetKey = toDateInputValue(target);
  const todayKey = toLocalDateIso(from);

  if (todayKey < startKey) return 0;
  if (todayKey > targetKey) return length;

  const elapsed = goalDayDiff(start, todayKey);
  if (elapsed === null || elapsed < 0) return null;
  return elapsed + 1;
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

export const formatGoalHeaderDescription = (
  start: string | null,
  target: string | null,
  from = new Date(),
): string => {
  const range = formatGoalRange(start, target);
  const length = goalDurationDays(start, target);
  const passed = goalDaysPassed(start, target, from);

  if (length === null || passed === null) return range;

  const dayWord = length === 1 ? "day" : "days";
  return `${range} · ${passed} of ${length} ${dayWord} passed.`;
};

export const objectiveCompletionStats = (goal: Goal) => {
  const totalObjectives = goal.objectives.length;
  const completedCount = goal.objectives.filter(
    (item) => item.completed,
  ).length;
  const progressPercent =
    totalObjectives > 0
      ? Math.round((completedCount / totalObjectives) * 100)
      : 0;
  const progressComplete =
    totalObjectives > 0 && completedCount === totalObjectives;

  return {
    completedCount,
    totalObjectives,
    progressPercent,
    progressComplete,
  };
};

export const objectiveProgress = (goal: Goal): string => {
  const { completedCount, totalObjectives } = objectiveCompletionStats(goal);
  if (totalObjectives === 0) return "No objectives";
  return `${completedCount}/${totalObjectives} objectives`;
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
