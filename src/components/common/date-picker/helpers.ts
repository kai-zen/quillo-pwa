export type DatePickerSize = "sm" | "md";

export interface DatePickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  clearable?: boolean;
  min?: string;
  max?: string;
  className?: string;
  sizeVariant?: DatePickerSize;
  placeholder?: string;
  "aria-label"?: string;
}

export const triggerSizeClass: Record<DatePickerSize, string> = {
  sm: "min-h-8 rounded-md py-1.5 pl-2.5 pr-8 text-xs",
  md: "min-h-10 rounded-lg py-2 pl-3 pr-10 text-sm",
};

export const iconSizeClass: Record<DatePickerSize, string> = {
  sm: "right-2.5 h-3.5 w-3.5",
  md: "right-3.5 h-4 w-4",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidIsoDate = (value: string): boolean => {
  if (!ISO_DATE.test(value)) return false;
  const date = parseIsoDate(value);
  if (!date) return false;
  return toIsoDate(date) === value;
};

export const parseIsoDate = (value: string): Date | null => {
  if (!ISO_DATE.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
};

export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (date: Date, amount: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isBeforeDay = (a: Date, b: Date): boolean => {
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return aDay < bDay;
};

export const isAfterDay = (a: Date, b: Date): boolean => isBeforeDay(b, a);

/** Monday-first weekday labels. */
export const WEEKDAY_LABELS = [
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
  "Su",
] as const;

/** 0 = Monday … 6 = Sunday */
export const mondayIndex = (date: Date): number => (date.getDay() + 6) % 7;

export interface CalendarDay {
  date: Date;
  iso: string;
  inMonth: boolean;
}

export const buildCalendarDays = (month: Date): CalendarDay[] => {
  const first = startOfMonth(month);
  const startOffset = mondayIndex(first);
  const gridStart = new Date(
    first.getFullYear(),
    first.getMonth(),
    first.getDate() - startOffset,
  );

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + i,
    );
    days.push({
      date,
      iso: toIsoDate(date),
      inMonth: date.getMonth() === month.getMonth(),
    });
  }
  return days;
};

const displayFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

export const formatDisplayDate = (value: string): string => {
  const date = parseIsoDate(value);
  if (!date) return value;
  return displayFormatter.format(date);
};

export const formatMonthLabel = (date: Date): string =>
  monthFormatter.format(date);

export const todayIso = (): string => toIsoDate(new Date());
