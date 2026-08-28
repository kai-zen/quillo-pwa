"use client";

import { useRouter } from "next/navigation";
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
import type { Sprint } from "@/shared/types";
import {
  formatSprintRange,
  sprintHref,
  SPRINT_STATUS_BADGE_CLASS,
  SPRINT_STATUS_DOT_CLASS,
  SPRINT_STATUS_LABELS,
} from "@/components/sprints/helpers";

interface Props {
  sprints: Sprint[];
}

const GoalSprintsTable: FC<Props> = ({ sprints }) => {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">#</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="w-52">Dates</TableHead>
          <TableHead className="w-32">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sprints.map((sprint) => (
          <TableRow
            key={sprint._id}
            onClick={() => router.push(sprintHref(sprint))}
            aria-label={`Open sprint ${sprint.sprint_number}: ${sprint.name}`}
          >
            <TableCell>
              <span className="font-mono text-xs font-semibold tabular-nums text-muted">
                #{sprint.sprint_number}
              </span>
            </TableCell>
            <TableCell>
              <span className="block truncate font-medium text-foreground">
                {sprint.name}
              </span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted">
                {formatSprintRange(sprint.start_date, sprint.end_date)}
              </span>
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                  SPRINT_STATUS_BADGE_CLASS[sprint.status],
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    SPRINT_STATUS_DOT_CLASS[sprint.status],
                  )}
                  aria-hidden
                />
                {SPRINT_STATUS_LABELS[sprint.status]}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default GoalSprintsTable;
