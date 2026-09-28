"use client";

import { Plus } from "lucide-react";
import { FC } from "react";
import { Button } from "@/components/common";
import type { Sprint } from "@/shared/types";
import GoalSprintsTable from "./GoalSprintsTable";

interface Props {
  sprints: Sprint[];
  onCreateSprint: () => void;
}

const GoalSprintsPanel: FC<Props> = ({ sprints, onCreateSprint }) => (
  <div className="mt-4 flex flex-col gap-3">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-foreground">Sprints</p>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium tabular-nums text-muted">
          {sprints.length} sprint{sprints.length === 1 ? "" : "s"}
        </span>
        <Button size="sm" variant="secondary" onClick={onCreateSprint}>
          <Plus className="h-4 w-4" aria-hidden />
          New sprint
        </Button>
      </div>
    </div>

    {sprints.length === 0 ? (
      <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
        <p className="font-medium text-foreground">No sprints yet</p>
        <p className="mt-1 text-sm text-muted">
          Create a sprint to plan work toward this goal.
        </p>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={onCreateSprint}
          startIcon={<Plus className="w-4" aria-hidden />}
        >
          New sprint
        </Button>
      </div>
    ) : (
      <GoalSprintsTable sprints={sprints} />
    )}
  </div>
);

export default GoalSprintsPanel;
