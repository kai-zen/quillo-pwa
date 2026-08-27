"use client";

import { Inbox, ListFilter, Plus } from "lucide-react";
import { FC, useState } from "react";
import { Button, Modal, PageHeader, Select } from "@/components/common";
import { useLabelsApi, useSprintsApi, useTasksApi } from "@/shared/hooks";
import type { Label, Task, TaskListQuery, TaskStatus } from "@/shared/types";
import { TASK_STATUSES } from "@/shared/types";
import { STATUS_LABELS } from "./helpers";
import TaskForm, { taskFormTitle, type TaskFormMode } from "./form/TaskForm";
import TaskSummaryTable from "./TaskSummaryTable";

const PAGE_LIMIT = 50;

const BacklogView: FC = () => {
  const { useTasksList } = useTasksApi();
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [labelFilter, setLabelFilter] = useState("");
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<TaskFormMode | null>(null);

  const listQuery: TaskListQuery = {
    page,
    limit: PAGE_LIMIT,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(labelFilter ? { label_ids: labelFilter } : {}),
  };

  const tasksQuery = useTasksList(listQuery);
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });

  const tasks = tasksQuery.data?.items ?? [];
  const labels: Label[] = labelsQuery.data?.items ?? [];
  const sprints = sprintsQuery.data?.items ?? [];
  const total = tasksQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isLoading =
    tasksQuery.isLoading || labelsQuery.isLoading || sprintsQuery.isLoading;
  const isError = tasksQuery.isError;
  const isEmpty = !isLoading && !isError && tasks.length === 0;
  const hasTasks = !isLoading && !isError && tasks.length > 0;

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title="Backlog"
        description="Capture, organize, and schedule your upcoming work."
        icon={Inbox}
        actions={
          <Button onClick={() => openCreate()} className="shadow-sm">
            <Plus className="h-4 w-4" aria-hidden />
            New task
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
        <span className="inline-flex items-center gap-2 pl-1 text-sm font-medium text-foreground">
          <ListFilter className="h-4 w-4 text-muted" aria-hidden />
          Filter
        </span>
        <span className="h-5 w-px bg-border" aria-hidden />
        <label className="sr-only" htmlFor="backlog-status-filter">
          Filter by status
        </label>
        <Select
          id="backlog-status-filter"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as TaskStatus | "");
            setPage(1);
          }}
          sizeVariant="sm"
          className="w-36"
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
        <label className="sr-only" htmlFor="backlog-label-filter">
          Filter by label
        </label>
        <Select
          id="backlog-label-filter"
          value={labelFilter}
          onChange={(event) => {
            setLabelFilter(event.target.value);
            setPage(1);
          }}
          sizeVariant="sm"
          className="w-40"
        >
          <option value="">All labels</option>
          {labels.map((label: Label) => (
            <option key={label._id} value={label._id}>
              {label.name}
            </option>
          ))}
        </Select>
        <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
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

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">No tasks yet</p>
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

      {hasTasks && (
        <TaskSummaryTable tasks={tasks} labels={labels} onEdit={openEdit} />
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
