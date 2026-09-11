"use client";

import { FC } from "react";
import { Input, cn } from "@/components/common";
import { formatNumberRange } from "@/components/progresses/helpers";
import type { Progress } from "@/shared/types";
import type { ProgressDraftValue } from "./useDailyProgressInputs";

interface Props {
  progress: Progress;
  value: ProgressDraftValue;
  disabled?: boolean;
  onChange: (value: ProgressDraftValue) => void;
}

const ProgressValueField: FC<Props> = ({
  progress,
  value,
  disabled,
  onChange,
}) => {
  if (progress.input_type === "boolean") {
    const selected = typeof value === "boolean" ? value : null;

    return (
      <div
        role="radiogroup"
        aria-label={`${progress.title} yes or no`}
        className="flex flex-wrap gap-2"
      >
        {[
          { label: "Yes", next: true },
          { label: "No", next: false },
        ].map(({ label, next }) => {
          const active = selected === next;

          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(next)}
              className={cn(
                "inline-flex cursor-pointer items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-surface text-muted hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  if (progress.input_type === "choice") {
    const options = progress.choice_options ?? [];
    const selected = typeof value === "string" ? value : "";

    return (
      <div
        role="radiogroup"
        aria-label={`${progress.title} options`}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const active = selected === option;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(option)}
              className={cn(
                "inline-flex cursor-pointer items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-surface text-muted hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  if (progress.input_type === "rating") {
    const [min, max] = progress.number_range ?? [1, 5];
    const selected = typeof value === "number" ? value : null;
    const options = Array.from({ length: max - min + 1 }, (_, index) => min + index);

    return (
      <div
        role="radiogroup"
        aria-label={`${progress.title} rating`}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const active = selected === option;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(option)}
              className={cn(
                "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-all",
                "disabled:cursor-not-allowed disabled:opacity-50",
                active
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-surface text-muted hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  }

  if (progress.input_type === "duration") {
    const numeric = typeof value === "number" ? String(value) : "";

    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={numeric}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === "" ? null : Number(next));
          }}
          disabled={disabled}
          aria-label={`${progress.title} duration in minutes`}
          className="max-w-[9rem]"
        />
        <span className="text-sm text-muted">minutes</span>
      </div>
    );
  }

  const [min, max] = progress.number_range ?? [];
  const numeric = typeof value === "number" ? String(value) : "";

  return (
    <Input
      type="number"
      inputMode="decimal"
      step="any"
      min={min}
      max={max}
      value={numeric}
      onChange={(event) => {
        const next = event.target.value;
        onChange(next === "" ? null : Number(next));
      }}
      disabled={disabled}
      aria-label={progress.title}
      placeholder={
        progress.number_range
          ? formatNumberRange(progress.number_range)
          : "Enter a number"
      }
      className="max-w-[12rem]"
    />
  );
};

export default ProgressValueField;
