"use client";

import { ArrowLeft, ListFilter, Pencil, Plus } from "lucide-react";
import { FC, useState } from "react";
import {
  Button,
  IconButton,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@/components/common";
import TaskForm, {
  taskFormTitle,
  type TaskFormMode,
} from "@/components/tasks/form/TaskForm";
import TaskSummaryTable from "@/components/tasks/TaskSummaryTable";
import { useLabelsApi, useSprintsApi, useTasksApi } from "@/shared/hooks";
import type {
  Label,
  RecordId,
  Sprint,
  SprintListQuery,
  SprintStatus,
  Task,
} from "@/shared/types";
import { SPRINT_STATUSES } from "@/shared/types";
import SprintForm, {
  sprintFormTitle,
  type SprintFormMode,
} from "./form/SprintForm";
import {
  formatSprintRange,
  SPRINT_STATUS_BADGE_CLASS,
  SPRINT_STATUS_DOT_CLASS,
  SPRINT_STATUS_LABELS,
} from "./helpers";

const PAGE_LIMIT = 50;

const SprintsView: FC = () => {
  const { useSprintsList } = useSprintsApi();
  const { useTasksList } = useTasksApi();
  const { useLabelsList } = useLabelsApi();

  const [statusFilter, setStatusFilter] = useState<SprintStatus | "">("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<RecordId | null>(null);
  const [sprintFormMode, setSprintFormMode] = useState<SprintFormMode | null>(
    null,
  );
  const [taskFormMode, setTaskFormMode] = useState<TaskFormMode | null>(null);

  const listQuery: SprintListQuery = {
    page,
    limit: PAGE_LIMIT,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const sprintsQuery = useSprintsList(listQuery);
  const catalogQuery = useSprintsList({ page: 1, limit: 100 });
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const tasksQuery = useTasksList(
    selectedId
      ? { page: 1, limit: PAGE_LIMIT, sprint_id: selectedId }
      : undefined,
    !!selectedId,
  );

  const sprints: Sprint[] = sprintsQuery.data?.items ?? [];
  const catalog: Sprint[] = catalogQuery.data?.items ?? [];
  const labels: Label[] = labelsQuery.data?.items ?? [];
  const tasks = tasksQuery.data?.items ?? [];
  const total = sprintsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const taskTotal = tasksQuery.data?.total ?? 0;

  const selectedSprint =
    (selectedId &&
      (catalog.find((sprint) => sprint._id === selectedId) ??
        sprints.find((sprint) => sprint._id === selectedId))) ||
    null;

  const isListLoading = sprintsQuery.isLoading;
  const isListError = sprintsQuery.isError;
  const isListEmpty = !isListLoading && !isListError && sprints.length === 0;

  const openCreateSprint = () => setSprintFormMode({ type: "create" });
  const openEditSprint = (sprint: Sprint) =>
    setSprintFormMode({ type: "edit", sprint });

  const openCreateTask = (parent?: Task) => {
    if (!selectedId) return;
    setTaskFormMode({
      type: "create",
      parentId: parent?._id ?? null,
      parentTitle: parent?.title,
      sprintId: selectedId,
    });
  };

  const openEditTask = (task: Task) => setTaskFormMode({ type: "edit", task });

  const closeSprintForm = () => setSprintFormMode(null);

  const onSprintSaved = (result?: { deleted?: boolean }) => {
    const editingId =
      sprintFormMode?.type === "edit" ? sprintFormMode.sprint._id : null;
    setSprintFormMode(null);
    if (result?.deleted && editingId && selectedId === editingId) {
      setSelectedId(null);
    }
  };

  const sprintModal = (
    <Modal
      open={!!sprintFormMode}
      onClose={closeSprintForm}
      title={sprintFormMode ? sprintFormTitle(sprintFormMode) : ""}
      className="max-w-lg"
    >
      {sprintFormMode && (
        <SprintForm
          key={
            sprintFormMode.type === "edit"
              ? sprintFormMode.sprint._id
              : "create"
          }
          mode={sprintFormMode}
          onClose={closeSprintForm}
          onSaved={onSprintSaved}
        />
      )}
    </Modal>
  );

  if (selectedId && selectedSprint) {
    const isTasksLoading = tasksQuery.isLoading || labelsQuery.isLoading;
    const isTasksError = tasksQuery.isError;
    const isTasksEmpty = !isTasksLoading && !isTasksError && tasks.length === 0;

    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            All sprints
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold tabular-nums text-muted">
                  #{selectedSprint.sprint_number}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                    SPRINT_STATUS_BADGE_CLASS[selectedSprint.status],
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      SPRINT_STATUS_DOT_CLASS[selectedSprint.status],
                    )}
                    aria-hidden
                  />
                  {SPRINT_STATUS_LABELS[selectedSprint.status]}
                </span>
              </div>
              <h1 className="mt-1.5 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                {selectedSprint.name}
              </h1>
              <p className="mt-1.5 text-sm text-muted">
                {formatSprintRange(
                  selectedSprint.start_date,
                  selectedSprint.end_date,
                )}
              </p>
              {selectedSprint.description ? (
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  {selectedSprint.description}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <IconButton
                label="Edit sprint"
                onClick={() => openEditSprint(selectedSprint)}
              >
                <Pencil className="h-4 w-4" aria-hidden />
              </IconButton>
              <Button onClick={() => openCreateTask()} className="shadow-sm">
                <Plus className="h-4 w-4" aria-hidden />
                New task
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">Tasks in this sprint</p>
          <span className="text-xs font-medium tabular-nums text-muted">
            {taskTotal} task{taskTotal === 1 ? "" : "s"}
          </span>
        </div>

        {sprintModal}

        <Modal
          open={!!taskFormMode}
          onClose={() => setTaskFormMode(null)}
          title={taskFormMode ? taskFormTitle(taskFormMode) : ""}
          className="max-w-3xl"
        >
          {taskFormMode && (
            <TaskForm
              key={
                taskFormMode.type === "edit"
                  ? taskFormMode.task._id
                  : `create-${taskFormMode.parentId ?? "root"}-${selectedId}`
              }
              mode={taskFormMode}
              labels={labels}
              sprints={catalog}
              onClose={() => setTaskFormMode(null)}
              onSaved={() => setTaskFormMode(null)}
              onCreateSubtask={
                taskFormMode.type === "edit" && !taskFormMode.task.parent_id
                  ? () => openCreateTask(taskFormMode.task)
                  : undefined
              }
            />
          )}
        </Modal>

        {isTasksLoading && (
          <p className="text-sm text-muted">Loading tasks…</p>
        )}

        {isTasksError && (
          <p className="text-sm text-foreground">
            Could not load sprint tasks. Try refreshing the page.
          </p>
        )}

        {isTasksEmpty && (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
              <Plus className="h-5 w-5 text-muted" aria-hidden />
            </div>
            <p className="font-medium text-foreground">
              No tasks in this sprint
            </p>
            <p className="mt-1 text-sm text-muted">
              Add a task here, or assign one from the backlog.
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => openCreateTask()}
              startIcon={<Plus className="w-4" aria-hidden />}
            >
              New task
            </Button>
          </div>
        )}

        {!isTasksLoading && !isTasksError && tasks.length > 0 && (
          <TaskSummaryTable
            tasks={tasks}
            labels={labels}
            onEdit={openEditTask}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
            Sprints
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Group work into timed buckets and focus on one at a time.
          </p>
        </div>
        <Button onClick={openCreateSprint} className="shadow-sm">
          <Plus className="h-4 w-4" aria-hidden />
          New sprint
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
        <span className="inline-flex items-center gap-2 pl-1 text-sm font-medium text-foreground">
          <ListFilter className="h-4 w-4 text-muted" aria-hidden />
          Filter
        </span>
        <span className="h-5 w-px bg-border" aria-hidden />
        <label className="sr-only" htmlFor="sprints-status-filter">
          Filter by status
        </label>
        <Select
          id="sprints-status-filter"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as SprintStatus | "");
            setPage(1);
          }}
          sizeVariant="sm"
          className="w-36"
        >
          <option value="">All statuses</option>
          {SPRINT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {SPRINT_STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
          {total} sprint{total === 1 ? "" : "s"}
        </span>
      </div>

      {sprintModal}

      {isListLoading && <p className="text-sm text-muted">Loading sprints…</p>}

      {isListError && (
        <p className="text-sm text-foreground">
          Could not load sprints. Try refreshing the page.
        </p>
      )}

      {isListEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft">
            <Plus className="h-5 w-5 text-muted" aria-hidden />
          </div>
          <p className="font-medium text-foreground">No sprints yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a sprint to plan a slice of work.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={openCreateSprint}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New sprint
          </Button>
        </div>
      )}

      {!isListLoading && !isListError && sprints.length > 0 && (
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
                onClick={() => setSelectedId(sprint._id)}
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
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || sprintsQuery.isFetching}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page >= totalPages || sprintsQuery.isFetching}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default SprintsView;
