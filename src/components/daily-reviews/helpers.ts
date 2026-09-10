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
