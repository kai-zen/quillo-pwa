"use client";

import { KeyboardEvent, ReactNode, useRef } from "react";
import { cn } from "@/components/common";

export interface ChoiceChipOption<T extends string | number> {
  value: T;
  label: ReactNode;
  selectedClassName?: string;
  className?: string;
}

interface Props<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: readonly ChoiceChipOption<T>[];
  "aria-label": string;
  className?: string;
}

function ChoiceChips<T extends string | number>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className,
}: Props<T>) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const moveTo = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    buttonsRef.current[index]?.focus();
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (options.length === 0) return;

    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % options.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + options.length) % options.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = options.length - 1;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    moveTo(nextIndex);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;

        return (
          <button
            key={String(option.value)}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              selected
                ? cn(
                    "border-transparent shadow-sm ring-1 ring-foreground/10",
                    option.selectedClassName ??
                      "bg-foreground text-background",
                  )
                : "border-border/80 bg-surface text-muted hover:border-foreground/30 hover:text-foreground",
              option.className,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default ChoiceChips;
