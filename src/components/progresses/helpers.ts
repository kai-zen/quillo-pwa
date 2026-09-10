import type { Progress, ProgressInputType } from "@/shared/types";
import { PROGRESS_INPUT_TYPES } from "@/shared/types";

export const PROGRESS_INPUT_TYPE_LABELS: Record<ProgressInputType, string> = {
  boolean: "Yes / no",
  number: "Number",
  duration: "Duration",
  rating: "Rating",
  choice: "Choice",
};

export const PROGRESS_INPUT_TYPE_HINTS: Record<ProgressInputType, string> = {
  boolean: "A yes or no check for each day.",
  number: "A number within a min–max range.",
  duration: "How long something took.",
  rating: "A score on a numeric scale.",
  choice: "Pick one of the options you define.",
};

export const PROGRESS_INPUT_TYPE_OPTIONS = PROGRESS_INPUT_TYPES;

export const formatNumberRange = (range: [number, number]): string =>
  `${range[0]} – ${range[1]}`;

export const formatProgressDetails = (progress: Progress): string => {
  if (progress.input_type === "number" || progress.input_type === "rating") {
    return progress.number_range
      ? formatNumberRange(progress.number_range)
      : "No range";
  }
  if (progress.input_type === "choice") {
    const options = progress.choice_options ?? [];
    if (options.length === 0) return "No options";
    return options.join(" · ");
  }
  return "—";
};
