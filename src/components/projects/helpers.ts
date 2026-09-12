import type {
  Project,
  ProjectStatus,
  UpdateProjectBody,
} from "@/shared/types";
import { PROJECT_STATUSES } from "@/shared/types";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const PROJECT_STATUS_BADGE_CLASS: Record<ProjectStatus, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  completed:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  archived:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

export const PROJECT_STATUS_DOT_CLASS: Record<ProjectStatus, string> = {
  active: "bg-emerald-500",
  completed: "bg-neutral-400",
  archived: "bg-amber-500",
};

export const PROJECT_STATUS_OPTIONS = PROJECT_STATUSES;

export const projectHref = (project: Project | string): string =>
  `/projects/${typeof project === "string" ? project : project._id}`;

export const toUpdateBody = (project: Project): UpdateProjectBody => ({
  name: project.name,
  description: project.description,
  status: project.status,
  color: project.color,
});

export const isValidProjectColor = (color: string): boolean =>
  /^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color);

export const toColorInputValue = (color: string): string => {
  if (/^#[\da-f]{6}$/i.test(color)) return color;
  if (/^#[\da-f]{3}$/i.test(color)) {
    const [red, green, blue] = color.slice(1);
    return `#${red}${red}${green}${green}${blue}${blue}`;
  }
  return "#3b82f6";
};
