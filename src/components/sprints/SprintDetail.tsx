"use client";

import { ListPlus, Pencil } from "lucide-react";
import { FC } from "react";
import {
  Button,
  IconButton,
  Markdown,
  PageHeader,
  cn,
} from "@/components/common";
import { LinkedNotes } from "@/components/notes";
import type { RecordId } from "@/shared/types";
import {
  formatSprintRange,
  SPRINT_STATUS_BADGE_CLASS,
  SPRINT_STATUS_DOT_CLASS,
  SPRINT_STATUS_LABELS,
} from "./helpers";
import { useSprintDetail } from "./hooks/useSprintDetail";
import SprintDetailModals from "./SprintDetailModals";
import SprintGoalLink from "./SprintGoalLink";
import SprintProgresses from "./SprintProgresses";
import SprintTasks from "./SprintTasks";

interface Props {
  sprintId: RecordId;
}

const SprintDetail: FC<Props> = ({ sprintId }) => {
  const view = useSprintDetail(sprintId);
  const {
    sprint,
    linkedGoal,
    linkedProgresses,
    isSprintLoading,
    isSprintError,
    isSprintMissing,
    isProgressesLoading,
    isProgressesError,
    pendingId,
    openEditSprint,
    openAddTasks,
    openAddProgress,
    removeProgress,
  } = view;

  if (isSprintLoading)
    return (
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm text-muted">Loading sprint…</p>
      </div>
    );

  if (isSprintError || isSprintMissing || !sprint)
    return (
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          title={isSprintError ? "Could not load sprint" : "Sprint not found"}
          description={
            isSprintError
              ? "Try refreshing the page."
              : "This sprint may have been deleted."
          }
          back={{ href: "/sprints", label: "All sprints" }}
        />
      </div>
    );

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-5">
      <PageHeader
        title={sprint.name}
        description={formatSprintRange(sprint.start_date, sprint.end_date)}
        back={{ href: "/sprints", label: "All sprints" }}
        eyebrow={
          <>
            <span className="font-mono text-xs font-semibold tabular-nums text-muted">
              #{sprint.sprint_number}
            </span>
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
          </>
        }
        actions={
          <>
            <IconButton label="Edit sprint" onClick={openEditSprint}>
              <Pencil className="h-4 w-4" aria-hidden />
            </IconButton>
            <Button onClick={openAddTasks} size="sm">
              <ListPlus className="h-4 w-4" aria-hidden />
              Add tasks
            </Button>
          </>
        }
      >
        {linkedGoal ? (
          <div className="mb-2">
            <SprintGoalLink goal={linkedGoal} size="sm" />
          </div>
        ) : null}
        {sprint.description ? (
          <Markdown compact>{sprint.description}</Markdown>
        ) : null}
      </PageHeader>

      <SprintTasks view={view} />

      <SprintProgresses
        progresses={linkedProgresses}
        isLoading={isProgressesLoading}
        isError={isProgressesError}
        pendingId={pendingId}
        onAdd={openAddProgress}
        onRemove={removeProgress}
      />

      <LinkedNotes of={sprint.name} sprintId={sprintId} />

      <SprintDetailModals view={view} />
    </div>
  );
};

export default SprintDetail;
