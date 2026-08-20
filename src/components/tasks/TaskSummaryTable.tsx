"use client";

import { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@/components/common";
import type { Label, Task } from "@/shared/types";
import {
  groupTasks,
  labelsById,
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABELS,
} from "./helpers";

interface Props {
  tasks: Task[];
  labels: Label[];
  onEdit: (task: Task) => void;
}

const TaskSummaryTable: FC<Props> = ({ tasks, labels, onEdit }) => {
  const labelMap = labelsById(labels);
  const rows = groupTasks(tasks).flatMap(({ task, children }) => [
    { task, depth: 0 },
    ...children.map((child) => ({ task: child, depth: 1 })),
  ]);

  if (rows.length === 0) return null;

  const resolveLabels = (task: Task): Label[] =>
    task.label_ids
      .map((id) => labelMap.get(id))
      .filter((label): label is Label => !!label);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="w-28">Status</TableHead>
          <TableHead className="w-56">Labels</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ task, depth }) => {
          const taskLabels = resolveLabels(task);

          return (
            <TableRow
              key={task._id}
              onClick={() => onEdit(task)}
              aria-label={`Edit task ${task.task_number}: ${task.title}`}
            >
              <TableCell>
                <span className="font-mono text-xs font-semibold tabular-nums text-muted">
                  #{task.task_number}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "block truncate font-medium text-foreground",
                    depth > 0 && "pl-5 text-muted",
                  )}
                >
                  {task.title}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                    STATUS_BADGE_CLASS[task.status],
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      STATUS_DOT_CLASS[task.status],
                    )}
                    aria-hidden
                  />
                  {STATUS_LABELS[task.status]}
                </span>
              </TableCell>
              <TableCell>
                {taskLabels.length === 0 ? (
                  <span className="text-xs text-muted">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {taskLabels.map((label) => (
                      <span
                        key={label._id}
                        className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: label.color }}
                          aria-hidden
                        />
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TaskSummaryTable;
