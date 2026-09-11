import { parseIsoDate } from "@/components/tasks/helpers";
import type { DailyReview } from "@/shared/types";

/** The API returns full ISO datetimes; the rest of the app works with plain yyyy-mm-dd. */
export const toIsoDay = (value: string): string => value.slice(0, 10);

export interface JournalMonthGroup {
  label: string;
  items: DailyReview[];
}

export const groupEntriesByMonth = (
  entries: DailyReview[],
): JournalMonthGroup[] => {
  const groups: JournalMonthGroup[] = [];

  for (const entry of entries) {
    const date = parseIsoDate(toIsoDay(entry.date));
    const label = date
      ? date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : "Undated";

    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(entry);
    else groups.push({ label, items: [entry] });
  }

  return groups;
};
