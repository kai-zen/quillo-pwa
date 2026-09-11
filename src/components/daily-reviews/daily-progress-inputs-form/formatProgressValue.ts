import type { Progress } from "@/shared/types";
import type { ProgressDraftValue } from "./useDailyProgressInputs";

export const formatProgressValue = (
  progress: Progress,
  value: ProgressDraftValue,
): string | null => {
  if (value === null || value === "") return null;

  if (progress.input_type === "boolean") {
    if (typeof value !== "boolean") return null;
    return value ? "Yes" : "No";
  }

  if (progress.input_type === "choice") {
    return typeof value === "string" ? value : null;
  }

  if (progress.input_type === "duration") {
    if (typeof value !== "number" || Number.isNaN(value)) return null;
    return `${value} min`;
  }

  if (
    progress.input_type === "number" ||
    progress.input_type === "rating"
  ) {
    return typeof value === "number" && !Number.isNaN(value)
      ? String(value)
      : null;
  }

  return null;
};
