import type {
  Goal,
  Progress,
  RecordId,
  Sprint,
  SprintStatus,
  UpdateSprintBody,
} from "@/shared/types";
import { GOAL_STATUS_LABELS } from "@/components/goals/helpers";
import { SPRINT_STATUSES } from "@/shared/types";

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const SPRINT_STATUS_BADGE_CLASS: Record<SprintStatus, string> = {
  planned: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  completed:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  archived: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export const SPRINT_STATUS_DOT_CLASS: Record<SprintStatus, string> = {
  planned: "bg-sky-500",
  active: "bg-emerald-500",
  completed: "bg-neutral-400",
  archived: "bg-rose-500",
};

export const SPRINT_STATUS_OPTIONS = SPRINT_STATUSES;

export const sprintHref = (id: RecordId | Sprint): string =>
  `/sprints/${typeof id === "string" ? id : id._id}`;

export const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return "";
  return value.slice(0, 10);
};

export const formatSprintDate = (value: string): string => {
  const date = new Date(`${toDateInputValue(value)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return toDateInputValue(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatSprintRange = (start: string, end: string): string =>
  `${formatSprintDate(start)} – ${formatSprintDate(end)}`;

export const daysUntil = (value: string, from = new Date()): number => {
  const end = new Date(`${toDateInputValue(value)}T00:00:00`);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (Number.isNaN(end.getTime())) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
};

export const formatSprintCountdown = (endDate: string): string => {
  const days = daysUntil(endDate);
  if (days > 1) return `${days} days left`;
  if (days === 1) return "1 day left";
  if (days === 0) return "Ends today";
  if (days === -1) return "Ended yesterday";
  return `Ended ${Math.abs(days)} days ago`;
};

export const pickActiveSprint = (sprints: Sprint[]): Sprint | null => {
  const active = sprints.filter((sprint) => sprint.status === "active");
  if (active.length === 0) return null;
  if (active.length === 1) return active[0];

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  const covering = active.filter((sprint) => {
    const start = toDateInputValue(sprint.start_date);
    const end = toDateInputValue(sprint.end_date);
    return start <= today && today <= end;
  });
  const pool = covering.length > 0 ? covering : active;

  return pool.reduce((best, sprint) =>
    sprint.sprint_number > best.sprint_number ? sprint : best,
  );
};

export const toUpdateBody = (sprint: Sprint): UpdateSprintBody => ({
  name: sprint.name,
  description: sprint.description,
  start_date: toDateInputValue(sprint.start_date),
  end_date: toDateInputValue(sprint.end_date),
  status: sprint.status,
  goal_id: sprint.goal_id,
  progress_ids: sprint.progress_ids ?? [],
});

export const findGoal = (
  goalId: RecordId | null,
  goals: Goal[],
): Goal | null => {
  if (!goalId) return null;
  return goals.find((goal) => goal._id === goalId) ?? null;
};

export const findProgresses = (
  ids: RecordId[] | undefined,
  progresses: Progress[],
): Progress[] => {
  if (!ids?.length) return [];
  const byId = new Map(progresses.map((item) => [item._id, item]));
  return ids
    .map((id) => byId.get(id))
    .filter((item): item is Progress => !!item);
};

export const formatGoalOptionLabel = (goal: Goal): string => {
  if (goal.status === "active") return goal.title;
  return `${goal.title} (${GOAL_STATUS_LABELS[goal.status]})`;
};
