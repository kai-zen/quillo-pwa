import type { Sprint, SprintStatus, UpdateSprintBody } from "@/shared/types";
import { SPRINT_STATUSES } from "@/shared/types";

export const SPRINT_STATUS_LABELS: Record<SprintStatus, string> = {
  planned: "Planned",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const SPRINT_STATUS_BADGE_CLASS: Record<SprintStatus, string> = {
  planned: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
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

export const toUpdateBody = (sprint: Sprint): UpdateSprintBody => ({
  name: sprint.name,
  description: sprint.description,
  start_date: toDateInputValue(sprint.start_date),
  end_date: toDateInputValue(sprint.end_date),
  status: sprint.status,
});
