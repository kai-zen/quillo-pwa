"use client";

import { ChevronDown } from "lucide-react";
import { FC } from "react";
import { cn } from "../cn";
import {
  chevronSizeClass,
  triggerSizeClass,
  type SelectProps,
} from "./helpers";
import SelectListbox from "./SelectListbox";
import { useSelect } from "./useSelect";

const Select: FC<SelectProps> = ({
  className,
  sizeVariant = "md",
  children,
  value,
  defaultValue,
  disabled,
  id,
  name,
  required,
  onChange,
  "aria-label": ariaLabel,
}) => {
  const {
    rootRef,
    listRef,
    listboxId,
    triggerId,
    options,
    open,
    activeIndex,
    selectedValue,
    selectedOption,
    toggleOpen,
    onTriggerKeyDown,
    setActiveOption,
    commit,
  } = useSelect({
    children,
    value,
    defaultValue,
    disabled,
    id,
    name,
    onChange,
  });

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <select
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute h-px w-px opacity-0"
        name={name}
        required={required}
        disabled={disabled}
        value={selectedValue}
        onChange={() => undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {typeof option.label === "string" ||
            typeof option.label === "number"
              ? option.label
              : option.value}
          </option>
        ))}
      </select>

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={toggleOpen}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "relative flex w-full cursor-pointer items-center border border-border bg-surface text-left text-foreground outline-none transition-[border-color,box-shadow,background-color]",
          "hover:border-foreground/40 hover:bg-accent-soft/40",
          "focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/10",
          open && "border-foreground ring-2 ring-foreground/10",
          disabled && "cursor-not-allowed opacity-50 hover:bg-surface",
          triggerSizeClass[sizeVariant],
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            !selectedOption && "text-muted",
          )}
        >
          {selectedOption?.label ?? "Select…"}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute text-muted transition-transform duration-150",
            chevronSizeClass[sizeVariant],
            open && "rotate-180 text-foreground",
          )}
        />
      </button>

      {open && (
        <SelectListbox
          listRef={listRef}
          listboxId={listboxId}
          triggerId={triggerId}
          options={options}
          selectedValue={selectedValue}
          activeIndex={activeIndex}
          sizeVariant={sizeVariant}
          onActiveChange={setActiveOption}
          onSelect={commit}
        />
      )}
    </div>
  );
};

export default Select;
