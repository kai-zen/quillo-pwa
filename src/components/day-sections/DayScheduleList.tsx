"use client";

import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/components/common";
import TaskAccordion from "@/components/tasks/task-day-cards/TaskAccordion";
import { useTaskListReorder } from "@/components/tasks/task-day-cards/useTaskListReorder";
import {
  isTaskSettled,
  labelsById,
} from "@/components/tasks/helpers";
import type { Label, RecordId, Task } from "@/shared/types";
import DailySectionRow from "./DailySectionRow";
import {
  buildDayScheduleItems,
  hiddenTaskIdsForCollapsedSections,
} from "./dayScheduleHelpers";
import type { DailySectionsActions } from "./useDailySectionsActions";
import { useDayScheduleReorder } from "./useDayScheduleReorder";

interface Props {
  date: string;
  sections: DailySectionsActions;
  tasks: Task[];
  labels: Label[];
  pendingId: RecordId | null;
  onEdit: (task: Task) => void;
  onCreateSubtask: (parent: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReorderError: (message: string) => void;
}

const DAY_ITEM_SELECTOR = "[data-day-item-id]";

const DayScheduleList: FC<Props> = ({
  date,
  sections: sectionActions,
  tasks,
  labels,
  pendingId,
  onEdit,
  onCreateSubtask,
  onToggleDone,
  onDelete,
  onReorderError,
}) => {
  const {
    sections,
    pending: sectionsPending,
    editingId,
    setEditingId,
    saveSectionTitle,
    requestDelete,
  } = sectionActions;

  const { reorderDayScheduleSafe } = useDayScheduleReorder(date);
  const labelMap = labelsById(labels);

  const items = useMemo(
    () => buildDayScheduleItems(sections, tasks),
    [sections, tasks],
  );

  const [collapsedSectionIds, setCollapsedSectionIds] = useState<
    Set<string>
  >(() => new Set());

  useEffect(() => {
    setCollapsedSectionIds(new Set());
  }, [date]);

  const toggleSectionCollapse = useCallback((sectionId: string) => {
    setCollapsedSectionIds((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const hiddenTaskIds = useMemo(
    () => hiddenTaskIdsForCollapsedSections(items, collapsedSectionIds),
    [collapsedSectionIds, items],
  );

  const ids = items.map((item) => item.id);
  const { listRef, activeId, dropSlot, bindHandle } = useTaskListReorder({
    ids,
    enabled: ids.length > 1,
    itemSelector: DAY_ITEM_SELECTOR,
    onReorder: (orderedIds) => {
      void reorderDayScheduleSafe(orderedIds, onReorderError);
    },
  });

  if (items.length === 0) return null;

  const resolveLabels = (task: Task): Label[] =>
    task.label_ids
      .map((id) => labelMap.get(id))
      .filter((label): label is Label => !!label);

  return (
    <ul
      ref={listRef}
      className={cn("flex flex-col gap-2", activeId && "select-none")}
      aria-label="Day schedule"
    >
      {items.map((item, index) => {
        const isHiddenTask =
          item.kind === "task" && hiddenTaskIds.has(item.id);

        return (
        <li
          key={item.id}
          data-day-item-id={item.id}
          className={cn(
            "relative",
            item.kind === "section" && "py-0",
            isHiddenTask && "hidden",
          )}
          aria-hidden={isHiddenTask || undefined}
        >
          {dropSlot === index ? (
            <div
              className="pointer-events-none absolute -top-1 right-2 left-2 z-10 h-0.5 rounded-full bg-foreground"
              aria-hidden
            />
          ) : null}

          {item.kind === "section" ? (
            <DailySectionRow
              section={item.section}
              editing={editingId === item.section._id}
              pending={sectionsPending}
              collapsed={collapsedSectionIds.has(item.section._id)}
              reorderHandle={
                ids.length > 1 && editingId !== item.section._id
                  ? {
                      ...bindHandle(item.id),
                      dragging: activeId === item.id,
                    }
                  : null
              }
              onStartEdit={() => setEditingId(item.section._id)}
              onSaveTitle={(title) => void saveSectionTitle(item.section, title)}
              onCancelEdit={() => setEditingId(null)}
              onDelete={() => requestDelete(item.section)}
              onToggleCollapse={() => toggleSectionCollapse(item.section._id)}
            />
          ) : (
            <TaskAccordion
              task={item.task}
              childrenTasks={item.children}
              labels={resolveLabels(item.task)}
              pendingId={pendingId}
              onEdit={onEdit}
              onCreateSubtask={onCreateSubtask}
              onToggleDone={onToggleDone}
              onDelete={onDelete}
              reorderHandle={
                ids.length > 1
                  ? {
                      ...bindHandle(item.id),
                      disabled: isTaskSettled(item.task),
                      dragging: activeId === item.id,
                    }
                  : null
              }
            />
          )}

          {index === items.length - 1 && dropSlot === items.length ? (
            <div
              className="pointer-events-none absolute -bottom-1 right-2 left-2 z-10 h-0.5 rounded-full bg-foreground"
              aria-hidden
            />
          ) : null}
        </li>
        );
      })}
    </ul>
  );
};

export default DayScheduleList;
