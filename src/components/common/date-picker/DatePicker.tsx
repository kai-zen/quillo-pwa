"use client";

import { Calendar } from "lucide-react";
import { FC } from "react";
import { cn } from "../cn";
import DatePickerCalendar from "./DatePickerCalendar";
import {
  formatDisplayDate,
  iconSizeClass,
  triggerSizeClass,
  type DatePickerProps,
} from "./helpers";
import { useDatePicker } from "./useDatePicker";

const DatePicker: FC<DatePickerProps> = ({
  className,
  sizeVariant = "md",
  value,
  defaultValue,
  disabled,
  id,
  name,
  required,
  onChange,
  clearable = true,
  min,
  max,
  placeholder = "Pick a date…",
  "aria-label": ariaLabel,
}) => {
  const {
    rootRef,
    popoverRef,
    popoverId,
    triggerId,
    open,
    placement,
    selectedValue,
    toggleOpen,
    onTriggerKeyDown,
    goPrevMonth,
    goNextMonth,
    viewMonth,
    commit,
    clear,
    selectToday,
  } = useDatePicker({
    value,
    defaultValue,
    disabled,
    id,
    name,
    onChange,
    clearable,
    min,
    max,
  });

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <input
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute h-px w-px opacity-0"
        name={name}
        required={required}
        disabled={disabled}
        value={selectedValue}
        onChange={() => undefined}
      />

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
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
            !selectedValue && "text-muted",
          )}
        >
          {selectedValue ? formatDisplayDate(selectedValue) : placeholder}
        </span>
        <Calendar
          aria-hidden
          className={cn(
            "pointer-events-none absolute text-muted transition-colors",
            iconSizeClass[sizeVariant],
            open && "text-foreground",
          )}
        />
      </button>

      {open && (
        <DatePickerCalendar
          popoverRef={popoverRef}
          popoverId={popoverId}
          triggerId={triggerId}
          placement={placement}
          viewMonth={viewMonth}
          selectedValue={selectedValue}
          min={min}
          max={max}
          clearable={clearable}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          onSelect={commit}
          onClear={clear}
          onToday={selectToday}
        />
      )}
    </div>
  );
};

export default DatePicker;
