"use client";

import { Plus } from "lucide-react";
import { FC, useState } from "react";
import { Button, Modal, Select } from "@/components/common";
import { useLabelsApi, useSprintsApi, useTasksApi } from "@/shared/hooks";
import type { Sprint, Task, TaskListQuery, TaskStatus } from "@/shared/types";
import { TASK_STATUSES } from "@/shared/types";
import { groupTasks, labelsById, STATUS_LABELS } from "./helpers";
import TaskForm, { taskFormTitle, type TaskFormMode } from "./form/TaskForm";
import TaskItem from "./TaskItem";

const PAGE_LIMIT = 50;

const BacklogView: FC = () => {
  const { useTasksList } = useTasksApi();
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<TaskFormMode | null>(null);

  const listQuery: TaskListQuery = {
    page,
    limit: PAGE_LIMIT,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const tasksQuery = useTasksList(listQuery);
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });

  const tasks = tasksQuery.data?.items ?? [];
  const labels = labelsQuery.data?.items ?? [];
  const sprints = sprintsQuery.data?.items ?? [];
  const total = tasksQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const groups = groupTasks(tasks);
  const labelMap = labelsById(labels);
  const sprintMap = new Map(
    sprints.map((sprint: Sprint) => [sprint._id, sprint]),
  ) as Map<string, Sprint>;

  const isLoading =
    tasksQuery.isLoading || labelsQuery.isLoading || sprintsQuery.isLoading;
  const isError = tasksQuery.isError;

  const openCreate = (parent?: Task) => {
    setFormMode({
      type: "create",
      parentId: parent?._id ?? null,
      parentTitle: parent?.title,
    });
  };

  const openEdit = (task: Task) => {
    setFormMode({ type: "edit", task });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Backlog
          </h1>
          <p className="mt-2 text-sm text-muted">
            Every task in one place. Schedule days and sprints from here.
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="h-4 w-4" aria-hidden />
          New task
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-muted" htmlFor="backlog-status-filter">
          Status
        </label>
        <Select
          id="backlog-status-filter"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as TaskStatus | "");
            setPage(1);
          }}
        >
          <option value="">All</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <span className="text-sm text-muted">
          {total} task{total === 1 ? "" : "s"}
        </span>
      </div>

      <Modal
        open={!!formMode}
        onClose={() => setFormMode(null)}
        title={formMode ? taskFormTitle(formMode) : ""}
        className="max-w-3xl"
      >
        {formMode && (
          <TaskForm
            key={
              formMode.type === "edit"
                ? formMode.task._id
                : `create-${formMode.parentId ?? "root"}`
            }
            mode={formMode}
            labels={labels}
            sprints={sprints}
            onClose={() => setFormMode(null)}
            onSaved={() => setFormMode(null)}
            onCreateSubtask={
              formMode.type === "edit" && !formMode.task.parent_id
                ? () => openCreate(formMode.task)
                : undefined
            }
          />
        )}
      </Modal>

      {isLoading && <p className="text-sm text-muted">Loading tasks…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load tasks. Try refreshing the page.
        </p>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
          <p className="text-lg text-foreground">No tasks yet.</p>
          <p className="mt-1 text-sm text-muted">
            Create your first task to start the backlog.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => openCreate()}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New task
          </Button>
        </div>
      )}

      {!isLoading && !isError && groups.length > 0 && (
        <ul className="rounded-lg border border-border bg-surface px-4">
          {groups.flatMap(({ task, children }) => [
            <TaskItem
              key={task._id}
              task={task}
              labelsById={labelMap}
              sprintsById={sprintMap}
              onEdit={openEdit}
              onAddSubtask={openCreate}
            />,
            ...children.map((child) => (
              <TaskItem
                key={child._id}
                task={child}
                depth={1}
                labelsById={labelMap}
                sprintsById={sprintMap}
                onEdit={openEdit}
                onAddSubtask={openCreate}
              />
            )),
          ])}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || tasksQuery.isFetching}
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
            disabled={page >= totalPages || tasksQuery.isFetching}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BacklogView;
