"use client";

import { Calendar } from "lucide-react";
import { FC } from "react";
import { cn } from "../cn";
import IconButton from "../IconButton";
import DatePickerCalendar from "./DatePickerCalendar";
import useDatePicker from "./useDatePicker";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}

const DatePickerIconButton: FC<Props> = ({
  value,
  onChange,
  disabled,
  min,
  max,
  label = "Pick a date",
  size = "sm",
  className,
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
    onChange,
    disabled,
    clearable: false,
    min,
    max,
  });

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <IconButton
        id={triggerId}
        label={label}
        size={size}
        active={open}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        onClick={toggleOpen}
        onKeyDown={onTriggerKeyDown}
      >
        <Calendar className="h-4 w-4" aria-hidden />
      </IconButton>

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
          clearable={false}
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

export default DatePickerIconButton;
