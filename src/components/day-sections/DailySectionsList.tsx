"use client";

import { FC } from "react";
import { cn } from "@/components/common";
import { useTaskListReorder } from "@/components/tasks/task-day-cards/useTaskListReorder";
import type { DailySection } from "@/shared/types";
import DailySectionRow from "./DailySectionRow";
import type { DailySectionsActions } from "./useDailySectionsActions";

interface Props {
  actions: DailySectionsActions;
}

const DailySectionsList: FC<Props> = ({ actions }) => {
  const {
    sections,
    pending,
    editingId,
    setEditingId,
    saveSectionTitle,
    reorderSections,
    requestDelete,
  } = actions;

  const ids = sections.map((section) => section._id);
  const { listRef, activeId, dropSlot, bindHandle } = useTaskListReorder({
    ids,
    enabled: ids.length > 1,
    onReorder: reorderSections,
    itemSelector: "[data-section-id]",
  });

  if (sections.length === 0) return null;

  return (
    <ul
      ref={listRef}
      className={cn("flex flex-col gap-1", activeId && "select-none")}
      aria-label="Day sections"
    >
      {sections.map((section: DailySection, index) => (
        <li key={section._id} className="relative">
          {dropSlot === index ? (
            <div
              className="pointer-events-none absolute -top-0.5 right-2 left-2 z-10 h-0.5 rounded-full bg-foreground"
              aria-hidden
            />
          ) : null}
          <DailySectionRow
            section={section}
            editing={editingId === section._id}
            pending={pending}
            reorderHandle={
              ids.length > 1
                ? {
                    ...bindHandle(section._id),
                    dragging: activeId === section._id,
                  }
                : null
            }
            onStartEdit={() => setEditingId(section._id)}
            onSaveTitle={(title) => void saveSectionTitle(section, title)}
            onCancelEdit={() => setEditingId(null)}
            onDelete={() => requestDelete(section)}
          />
          {index === sections.length - 1 && dropSlot === sections.length ? (
            <div
              className="pointer-events-none absolute -bottom-0.5 right-2 left-2 z-10 h-0.5 rounded-full bg-foreground"
              aria-hidden
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default DailySectionsList;
