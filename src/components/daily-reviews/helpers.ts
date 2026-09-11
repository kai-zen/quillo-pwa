import type { LucideIcon } from "lucide-react";
import {
  Angry,
  Annoyed,
  Cloud,
  CloudRain,
  Frown,
  Heart,
  Laugh,
  Leaf,
  Meh,
  Moon,
  Smile,
  Sparkles,
  Sun,
  Sunrise,
  Trophy,
  Wind,
} from "lucide-react";
import { parseIsoDate, todayIso } from "@/components/tasks/helpers";
import { DAILY_REVIEW_MOODS, type DailyReviewMood } from "@/shared/types";

export const isReviewableDate = (iso: string): boolean => {
  if (!parseIsoDate(iso)) return false;
  return iso <= todayIso();
};

export const formatMoodLabel = (mood: DailyReviewMood): string =>
  mood.charAt(0).toUpperCase() + mood.slice(1);

export const MOOD_OPTIONS = DAILY_REVIEW_MOODS;

export const MOOD_ICONS: Record<DailyReviewMood, LucideIcon> = {
  awful: Frown,
  bad: Frown,
  sad: CloudRain,
  angry: Angry,
  anxious: Cloud,
  overwhelmed: CloudRain,
  frustrated: Annoyed,
  tired: Moon,
  lonely: Cloud,
  bored: Meh,
  okay: Meh,
  restless: Wind,
  calm: Leaf,
  good: Smile,
  happy: Smile,
  grateful: Heart,
  proud: Sun,
  hopeful: Sparkles,
  excited: Sparkles,
  great: Laugh,
};

/** Broad emotional grouping, used to color-code moods without a numeric score. */
export type MoodTone = "low" | "neutral" | "high";

export const MOOD_TONE: Record<DailyReviewMood, MoodTone> = {
  awful: "low",
  bad: "low",
  sad: "low",
  angry: "low",
  anxious: "low",
  overwhelmed: "low",
  frustrated: "low",
  tired: "low",
  lonely: "low",
  bored: "low",
  okay: "neutral",
  restless: "neutral",
  calm: "neutral",
  good: "high",
  happy: "high",
  grateful: "high",
  proud: "high",
  hopeful: "high",
  excited: "high",
  great: "high",
};

export const MOOD_TONE_LABEL: Record<MoodTone, string> = {
  low: "Hard",
  neutral: "Neutral",
  high: "Good",
};

export const MOOD_TONE_CLASSES: Record<
  MoodTone,
  { chip: string; icon: string; selected: string }
> = {
  low: {
    chip: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    icon: "text-rose-400 dark:text-rose-500",
    selected:
      "border-rose-400 bg-rose-100 text-rose-800 dark:border-rose-600 dark:bg-rose-950 dark:text-rose-200",
  },
  neutral: {
    chip: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
    icon: "text-neutral-400 dark:text-neutral-500",
    selected:
      "border-neutral-400 bg-neutral-100 text-neutral-700 dark:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100",
  },
  high: {
    chip: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    icon: "text-emerald-400 dark:text-emerald-500",
    selected:
      "border-emerald-400 bg-emerald-100 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200",
  },
};
