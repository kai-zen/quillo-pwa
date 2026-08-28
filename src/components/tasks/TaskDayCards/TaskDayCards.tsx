"use client";

import { FC } from "react";
import { cn } from "@/components/common";
import type { Label, RecordId, Task } from "@/shared/types";
import {
  compareDoneLast,
  compareSortOrder,
  groupTasks,
  labelsById,
} from "../helpers";
import TaskAccordion from "./TaskAccordion";
import { useTaskListReorder } from "./useTaskListReorder";

interface Props {
  tasks: Task[];
  labels: Label[];
  pendingId: RecordId | null;
  onEdit: (task: Task) => void;
  onCreateSubtask: (parent: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReorder: (orderedIds: RecordId[]) => void;
}

const TaskDayCards: FC<Props> = ({
  tasks,
  labels,
  pendingId,
  onEdit,
  onCreateSubtask,
  onToggleDone,
  onDelete,
  onReorder,
}) => {
  const labelMap = labelsById(labels);
  const groups = groupTasks(tasks)
    .map((group) => ({
      ...group,
      children: [...group.children].sort(compareDoneLast),
    }))
    .sort((a, b) => compareSortOrder(a.task, b.task));

  const ids = groups.map((group) => group.task._id);
  const { listRef, activeId, dropSlot, bindHandle } = useTaskListReorder({
    ids,
    enabled: ids.length > 1,
    onReorder,
  });

  if (groups.length === 0) return null;

  const resolveLabels = (task: Task): Label[] =>
    task.label_ids
      .map((id) => labelMap.get(id))
      .filter((label): label is Label => !!label);

  return (
    <ul
      ref={listRef}
      className={cn("flex flex-col gap-2", activeId && "select-none")}
    >
      {groups.map(({ task, children }, index) => (
        <li key={task._id} data-task-id={task._id} className="relative">
          {dropSlot === index ? (
            <div
              className="pointer-events-none absolute -top-1 right-2 left-2 z-10 h-0.5 rounded-full bg-foreground"
              aria-hidden
            />
          ) : null}
          <TaskAccordion
            task={task}
            childrenTasks={children}
            labels={resolveLabels(task)}
            pendingId={pendingId}
            onEdit={onEdit}
            onCreateSubtask={onCreateSubtask}
            onToggleDone={onToggleDone}
            onDelete={onDelete}
            reorderHandle={{
              ...bindHandle(task._id),
              disabled: ids.length < 2,
              dragging: activeId === task._id,
            }}
          />
          {index === groups.length - 1 && dropSlot === groups.length ? (
            <div
              className="pointer-events-none absolute -bottom-1 right-2 left-2 z-10 h-0.5 rounded-full bg-foreground"
              aria-hidden
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default TaskDayCards;
