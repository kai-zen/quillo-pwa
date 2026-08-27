"use client";

import { FC, KeyboardEvent, ReactNode, useRef } from "react";
import { cn } from "./cn";

export interface TabOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: TabOption[];
  disabled?: boolean;
  className?: string;
  "aria-label": string;
}

const Tabs: FC<Props> = ({
  value,
  onChange,
  options,
  disabled,
  className,
  "aria-label": ariaLabel,
}) => {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const enabledIndexes = options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const tabbableIndex =
    selectedIndex >= 0 && !options[selectedIndex]?.disabled
      ? selectedIndex
      : (enabledIndexes[0] ?? -1);

  const moveTo = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    buttonsRef.current[index]?.focus();
  };

  const onRadioKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (disabled || enabledIndexes.length === 0) return;

    const currentPos = enabledIndexes.indexOf(index);
    const pos = currentPos === -1 ? 0 : currentPos;
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = enabledIndexes[(pos + 1) % enabledIndexes.length];
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        enabledIndexes[
          (pos - 1 + enabledIndexes.length) % enabledIndexes.length
        ];
    } else if (event.key === "Home") {
      nextIndex = enabledIndexes[0];
    } else if (event.key === "End") {
      nextIndex = enabledIndexes[enabledIndexes.length - 1];
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    moveTo(nextIndex);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn("flex rounded-lg bg-accent-soft/50 p-1", className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        const optionDisabled = Boolean(disabled || option.disabled);

        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonsRef.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={optionDisabled}
            tabIndex={optionDisabled || index !== tabbableIndex ? -1 : 0}
            onClick={() => moveTo(index)}
            onKeyDown={(event) => onRadioKeyDown(event, index)}
            className={cn(
              "min-w-0 flex-1 cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "shadow-sm bg-surface text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
