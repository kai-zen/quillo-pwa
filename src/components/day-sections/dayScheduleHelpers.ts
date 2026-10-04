import {
  compareDoneLast,
  compareSortOrder,
  groupTasks,
  type TaskGroup,
} from "@/components/tasks/helpers";
import type { DailySection, RecordId, Task } from "@/shared/types";
import { sectionsFromDaily } from "./helpers";

export const DAY_ITEM_SECTION_PREFIX = "section:";
export const DAY_ITEM_TASK_PREFIX = "task:";

export type DayScheduleItem =
  | {
      kind: "section";
      id: string;
      section: DailySection;
      sort_order: number;
    }
  | {
      kind: "task";
      id: string;
      task: Task;
      children: Task[];
      sort_order: number;
    };

export const dayItemId = (
  kind: DayScheduleItem["kind"],
  recordId: RecordId,
): string =>
  kind === "section"
    ? `${DAY_ITEM_SECTION_PREFIX}${recordId}`
    : `${DAY_ITEM_TASK_PREFIX}${recordId}`;

export const parseDayItemId = (
  id: string,
): { kind: DayScheduleItem["kind"]; recordId: RecordId } | null => {
  if (id.startsWith(DAY_ITEM_SECTION_PREFIX)) {
    return {
      kind: "section",
      recordId: id.slice(DAY_ITEM_SECTION_PREFIX.length),
    };
  }
  if (id.startsWith(DAY_ITEM_TASK_PREFIX)) {
    return {
      kind: "task",
      recordId: id.slice(DAY_ITEM_TASK_PREFIX.length),
    };
  }
  return null;
};

export const maxUnifiedSortOrder = (
  sections: DailySection[],
  tasks: Task[],
): number => {
  const groups = groupTasks(tasks);
  const orders = [
    ...sections.map((section) => section.sort_order),
    ...groups.map((group) => group.task.sort_order),
  ];
  return orders.length ? Math.max(...orders) : -1;
};

export const buildDayScheduleItems = (
  sections: DailySection[],
  tasks: Task[],
): DayScheduleItem[] => {
  const sortedSections = sectionsFromDaily(sections);
  const hasSections = sortedSections.length > 0;
  const groups = groupTasks(tasks);
  const byChildOrder = (a: Task, b: Task) =>
    compareDoneLast(a, b) || compareSortOrder(a, b);

  const items: DayScheduleItem[] = [
    ...sortedSections.map((section) => ({
      kind: "section" as const,
      id: dayItemId("section", section._id),
      section,
      sort_order: section.sort_order,
    })),
    ...groups.map((group: TaskGroup) => ({
      kind: "task" as const,
      id: dayItemId("task", group.task._id),
      task: group.task,
      children: [...group.children].sort(byChildOrder),
      sort_order: group.task.sort_order,
    })),
  ];

  return items.sort((a, b) => {
    const orderDiff = a.sort_order - b.sort_order;
    if (orderDiff !== 0) return orderDiff;
    if (a.kind !== b.kind) return a.kind === "section" ? -1 : 1;
    if (a.kind === "task" && b.kind === "task") {
      return hasSections
        ? compareSortOrder(a.task, b.task)
        : byChildOrder(a.task, b.task);
    }
    return 0;
  });
};

export const hiddenTaskIdsForCollapsedSections = (
  items: DayScheduleItem[],
  collapsedSectionIds: ReadonlySet<string>,
): Set<string> => {
  const hidden = new Set<string>();
  let activeSectionId: RecordId | null = null;

  for (const item of items) {
    if (item.kind === "section") {
      activeSectionId = item.section._id;
      continue;
    }
    if (
      activeSectionId &&
      collapsedSectionIds.has(activeSectionId)
    ) {
      hidden.add(item.id);
    }
  }

  return hidden;
};

export const splitUnifiedOrder = (orderedIds: string[]) => {
  const sectionItems: { id: RecordId; sort_order: number }[] = [];
  const taskItems: { id: RecordId; sort_order: number }[] = [];

  orderedIds.forEach((compositeId, sort_order) => {
    const parsed = parseDayItemId(compositeId);
    if (!parsed) return;
    if (parsed.kind === "section") {
      sectionItems.push({ id: parsed.recordId, sort_order });
    } else {
      taskItems.push({ id: parsed.recordId, sort_order });
    }
  });

  return { sectionItems, taskItems };
};
