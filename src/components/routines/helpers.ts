import type {
  DayOfWeek,
  Routine,
  RoutineDraft,
  RoutineDraftBody,
  RoutineRepeat,
  UpdateRoutineBody,
} from "@/shared/types";
import { DAYS_OF_WEEK } from "@/shared/types";

export const REPEAT_LABELS: Record<RoutineRepeat, string> = {
  everyday: "Every day",
  weekly: "Weekly",
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

export const REPEAT_OPTIONS: RoutineRepeat[] = ["everyday", "weekly"];

export const dayOfWeekFromIso = (iso: string): DayOfWeek => {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  const jsDay = Number.isNaN(date.getTime()) ? 1 : date.getDay();
  return DAYS_OF_WEEK[(jsDay + 6) % 7];
};

export const formatRoutineDate = (iso: string): string => {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export const formatSchedule = (routine: Routine): string => {
  if (routine.repeat === "everyday") return REPEAT_LABELS.everyday;
  if (routine.days_of_week.length === 0) return REPEAT_LABELS.weekly;
  const days = DAYS_OF_WEEK.filter((day) =>
    routine.days_of_week.includes(day),
  ).map((day) => DAY_SHORT_LABELS[day]);
  return `${REPEAT_LABELS.weekly} · ${days.join(", ")}`;
};

export const toDraftBody = (draft: RoutineDraft): RoutineDraftBody => ({
  title: draft.title,
  priority: draft.priority,
  description: draft.description,
  label_ids: draft.label_ids,
});

export const toUpdateBody = (routine: Routine): UpdateRoutineBody => ({
  name: routine.name,
  repeat: routine.repeat,
  days_of_week: routine.repeat === "everyday" ? [] : routine.days_of_week,
  drafts: routine.drafts.map(toDraftBody),
});
