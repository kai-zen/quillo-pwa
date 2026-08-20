"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { FC, RefObject } from "react";
import { cn } from "../cn";
import IconButton from "../IconButton";
import {
  buildCalendarDays,
  formatMonthLabel,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  parseIsoDate,
  todayIso,
  WEEKDAY_LABELS,
  type DatePickerPlacement,
} from "./helpers";

interface Props {
  popoverRef: RefObject<HTMLDivElement | null>;
  popoverId: string;
  triggerId: string;
  placement: DatePickerPlacement;
  viewMonth: Date;
  selectedValue: string;
  min?: string;
  max?: string;
  clearable: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelect: (iso: string) => void;
  onClear: () => void;
  onToday: () => void;
}

const DatePickerCalendar: FC<Props> = ({
  popoverRef,
  popoverId,
  triggerId,
  placement,
  viewMonth,
  selectedValue,
  min,
  max,
  clearable,
  onPrevMonth,
  onNextMonth,
  onSelect,
  onClear,
  onToday,
}) => {
  const days = buildCalendarDays(viewMonth);
  const selectedDate = parseIsoDate(selectedValue);
  const today = parseIsoDate(todayIso())!;
  const minDate = min ? parseIsoDate(min) : null;
  const maxDate = max ? parseIsoDate(max) : null;

  return (
    <div
      ref={popoverRef}
      id={popoverId}
      role="dialog"
      aria-modal="false"
      aria-labelledby={triggerId}
      className={cn(
        "absolute z-50 w-[min(100%,19.5rem)] rounded-lg border border-border bg-surface p-3 shadow-lg shadow-black/10 dark:shadow-black/50",
        placement === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <IconButton label="Previous month" size="sm" onClick={onPrevMonth}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </IconButton>
        <p className="text-sm font-medium text-foreground">
          {formatMonthLabel(viewMonth)}
        </p>
        <IconButton label="Next month" size="sm" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </IconButton>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[11px] font-medium text-muted"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const selected = selectedDate
            ? isSameDay(day.date, selectedDate)
            : false;
          const isToday = isSameDay(day.date, today);
          const outOfRange =
            (minDate && isBeforeDay(day.date, minDate)) ||
            (maxDate && isAfterDay(day.date, maxDate));

          return (
            <button
              key={day.iso}
              type="button"
              disabled={!!outOfRange}
              aria-label={day.iso}
              aria-pressed={selected}
              onClick={() => onSelect(day.iso)}
              className={cn(
                "flex h-8 w-full cursor-pointer items-center justify-center rounded-md text-sm transition-colors",
                outOfRange && "cursor-default opacity-30",
                !outOfRange && !selected && "hover:bg-accent-soft",
                day.inMonth && !selected && "text-foreground",
                !day.inMonth && !selected && "text-muted",
                isToday && !selected && day.inMonth && "font-semibold",
                selected &&
                  "bg-foreground text-background hover:bg-foreground hover:text-background",
              )}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2.5">
        {clearable ? (
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
          >
            Clear
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onToday}
          className="cursor-pointer rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default DatePickerCalendar;
