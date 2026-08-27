"use client";

import { FC } from "react";
import type { Label, RecordId, Task } from "@/shared/types";
import { compareDoneLast, groupTasks, labelsById } from "../helpers";
import TaskAccordion from "./TaskAccordion";

interface Props {
  tasks: Task[];
  labels: Label[];
  pendingId: RecordId | null;
  onEdit: (task: Task) => void;
  onCreateSubtask: (parent: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskDayCards: FC<Props> = ({
  tasks,
  labels,
  pendingId,
  onEdit,
  onCreateSubtask,
  onToggleDone,
  onDelete,
}) => {
  const labelMap = labelsById(labels);
  const groups = groupTasks(tasks)
    .map((group) => ({
      ...group,
      children: [...group.children].sort(compareDoneLast),
    }))
    .sort((a, b) => compareDoneLast(a.task, b.task));

  if (groups.length === 0) return null;

  const resolveLabels = (task: Task): Label[] =>
    task.label_ids
      .map((id) => labelMap.get(id))
      .filter((label): label is Label => !!label);

  return (
    <ul className="flex flex-col gap-2">
      {groups.map(({ task, children }) => (
        <li key={task._id}>
          <TaskAccordion
            task={task}
            childrenTasks={children}
            labels={resolveLabels(task)}
            pendingId={pendingId}
            onEdit={onEdit}
            onCreateSubtask={onCreateSubtask}
            onToggleDone={onToggleDone}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
};

export default TaskDayCards;
