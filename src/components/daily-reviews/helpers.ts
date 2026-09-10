import { parseIsoDate, todayIso } from "@/components/tasks/helpers";
import { DAILY_REVIEW_MOODS, type DailyReviewMood } from "@/shared/types";

export const isReviewableDate = (iso: string): boolean => {
  if (!parseIsoDate(iso)) return false;
  return iso <= todayIso();
};

export const formatMoodLabel = (mood: DailyReviewMood): string =>
  mood.charAt(0).toUpperCase() + mood.slice(1);

export const MOOD_OPTIONS = DAILY_REVIEW_MOODS;
