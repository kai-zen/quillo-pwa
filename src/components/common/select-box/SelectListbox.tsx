"use client";

import { Check } from "lucide-react";
import { FC, RefObject } from "react";
import { cn } from "../cn";
import {
  optionSizeClass,
  type SelectOption,
  type SelectSize,
} from "./helpers";
import type { PopoverPlacement } from "../placement";

interface Props {
  listRef: RefObject<HTMLUListElement | null>;
  listboxId: string;
  triggerId: string;
  placement: PopoverPlacement;
  options: SelectOption[];
  selectedValue: string;
  activeIndex: number;
  sizeVariant: SelectSize;
  onActiveChange: (index: number, option: SelectOption) => void;
  onSelect: (value: string) => void;
}

const SelectListbox: FC<Props> = ({
  listRef,
  listboxId,
  triggerId,
  placement,
  options,
  selectedValue,
  activeIndex,
  sizeVariant,
  onActiveChange,
  onSelect,
}) => (
  <ul
    ref={listRef}
    id={listboxId}
    role="listbox"
    aria-labelledby={triggerId}
    className={cn(
      "absolute z-50 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg shadow-black/10 dark:border-border dark:bg-surface dark:shadow-black/50",
      placement === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
    )}
  >
    {options.map((option, index) => {
      const selected = option.value === selectedValue;
      const active = index === activeIndex;

      return (
        <li
          key={option.value}
          role="option"
          aria-selected={selected}
          aria-disabled={option.disabled || undefined}
          data-index={index}
          className={cn(
            "flex cursor-pointer items-center justify-between gap-3 transition-colors",
            optionSizeClass[sizeVariant],
            option.disabled && "cursor-not-allowed opacity-40",
            !option.disabled && active && "bg-accent-soft",
            !option.disabled && selected && !active && "bg-accent-soft/70",
            !option.disabled && "hover:bg-accent-soft",
          )}
          onMouseEnter={() => onActiveChange(index, option)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (option.disabled) return;
            onSelect(option.value);
          }}
        >
          <span className="min-w-0 flex-1 truncate text-foreground">
            {option.label}
          </span>
          {selected && (
            <Check
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-foreground"
            />
          )}
        </li>
      );
    })}
  </ul>
);

export default SelectListbox;
