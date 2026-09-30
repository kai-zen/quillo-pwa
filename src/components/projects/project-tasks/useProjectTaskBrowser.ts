"use client";

import { useEffect, useState } from "react";
import { toUpdateBody } from "@/components/tasks/helpers";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
import type { RecordId, Task, TaskPriority, TaskStatus } from "@/shared/types";
import { TASK_STATUSES } from "@/shared/types";
import {
  hasProjectTaskFilters,
  PROJECT_TASK_PAGE_LIMIT,
  projectTaskQuery,
  visibleStatuses,
  type ProjectTaskFilters,
  type ProjectTaskFocus,
  type ProjectTaskLayout,
} from "./helpers";

const INITIAL_PAGES: Record<TaskStatus, number> = {
  todo: 1,
  doing: 1,
  done: 1,
  paused: 1,
  cancelled: 1,
};

export interface ProjectStatusSlice {
  status: TaskStatus;
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export type ProjectTaskListState =
  | "loading"
  | "error"
  | "empty-project"
  | "empty-focus"
  | "empty-filter"
  | "ready";

export function useProjectTaskBrowser(projectId: RecordId) {
  const { useTasksList, updateTask } = useTasksApi();
  const [focus, setFocus] = useState<ProjectTaskFocus>("open");
  const [layout, setLayout] = useState<ProjectTaskLayout>("list");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [labelId, setLabelId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [pendingId, setPendingId] = useState<RecordId | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const filters: ProjectTaskFilters = {
    labelId,
    sprintId,
    priority,
    search,
  };
  const hasFilters = hasProjectTaskFilters(filters);
  const filterKey = `${search}|${labelId}|${sprintId}|${priority}`;
  const [pageFilterKey, setPageFilterKey] = useState(filterKey);
  if (pageFilterKey !== filterKey) {
    setPageFilterKey(filterKey);
    setPages(INITIAL_PAGES);
  }
  const activePages = pageFilterKey === filterKey ? pages : INITIAL_PAGES;

  const enabled = !!projectId;
  const shown = visibleStatuses(focus);

  const todoList = useTasksList(
    projectTaskQuery(
      projectId,
      "todo",
      activePages.todo,
      PROJECT_TASK_PAGE_LIMIT,
      filters,
    ),
    enabled && shown.includes("todo"),
  );
  const doingList = useTasksList(
    projectTaskQuery(
      projectId,
      "doing",
      activePages.doing,
      PROJECT_TASK_PAGE_LIMIT,
      filters,
    ),
    enabled && shown.includes("doing"),
  );
  const pausedList = useTasksList(
    projectTaskQuery(
      projectId,
      "paused",
      activePages.paused,
      PROJECT_TASK_PAGE_LIMIT,
      filters,
    ),
    enabled && shown.includes("paused"),
  );
  const doneList = useTasksList(
    projectTaskQuery(
      projectId,
      "done",
      activePages.done,
      PROJECT_TASK_PAGE_LIMIT,
      filters,
    ),
    enabled && shown.includes("done"),
  );
  const cancelledList = useTasksList(
    projectTaskQuery(
      projectId,
      "cancelled",
      activePages.cancelled,
      PROJECT_TASK_PAGE_LIMIT,
      filters,
    ),
    enabled && shown.includes("cancelled"),
  );

  const todoCount = useTasksList(
    projectTaskQuery(projectId, "todo", 1, 1, filters),
    enabled && !shown.includes("todo"),
  );
  const doingCount = useTasksList(
    projectTaskQuery(projectId, "doing", 1, 1, filters),
    enabled && !shown.includes("doing"),
  );
  const pausedCount = useTasksList(
    projectTaskQuery(projectId, "paused", 1, 1, filters),
    enabled && !shown.includes("paused"),
  );
  const doneCountQuery = useTasksList(
    projectTaskQuery(projectId, "done", 1, 1, filters),
    enabled && !shown.includes("done"),
  );
  const cancelledCount = useTasksList(
    projectTaskQuery(projectId, "cancelled", 1, 1, filters),
    enabled && !shown.includes("cancelled"),
  );

  const lists = {
    todo: todoList,
    doing: doingList,
    paused: pausedList,
    done: doneList,
    cancelled: cancelledList,
  };
  const counts = {
    todo: todoCount,
    doing: doingCount,
    paused: pausedCount,
    done: doneCountQuery,
    cancelled: cancelledCount,
  };

  const totalFor = (status: TaskStatus): number | null => {
    const list = lists[status];
    const count = counts[status];
    if (list.data) return list.data.total;
    if (count.data) return count.data.total;
    return null;
  };

  const countByStatus = TASK_STATUSES.reduce(
    (accumulator, status) => {
      accumulator[status] = totalFor(status);
      return accumulator;
    },
    {} as Record<TaskStatus, number | null>,
  );

  const slices: ProjectStatusSlice[] = shown.map((status) => {
    const query = lists[status];
    const total = query.data?.total ?? 0;
    return {
      status,
      tasks: query.data?.items ?? [],
      total,
      page: activePages[status],
      totalPages: Math.max(1, Math.ceil(total / PROJECT_TASK_PAGE_LIMIT)),
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isError: query.isError,
    };
  });

  const openCount = (["doing", "todo", "paused"] as const).reduce<number | null>(
    (sum, status) => {
      const value = countByStatus[status];
      if (sum === null || value === null) return null;
      return sum + value;
    },
    0,
  );

  const archiveCount = (["done", "cancelled"] as const).reduce<number | null>(
    (sum, status) => {
      const value = countByStatus[status];
      if (sum === null || value === null) return null;
      return sum + value;
    },
    0,
  );

  const projectTotal =
    openCount === null || archiveCount === null ? null : openCount + archiveCount;

  const visibleResolved = slices.every((slice) => !slice.isLoading);
  const visibleTotal = slices.reduce((sum, slice) => sum + slice.total, 0);
  const allErrored = slices.length > 0 && slices.every((slice) => slice.isError);

  let listState: ProjectTaskListState = "ready";
  if (allErrored) listState = "error";
  else if (!visibleResolved && slices.every((slice) => slice.tasks.length === 0))
    listState = "loading";
  else if (visibleResolved && visibleTotal === 0) {
    if (hasFilters) listState = "empty-filter";
    else if (projectTotal === null) listState = "loading";
    else if (projectTotal === 0) listState = "empty-project";
    else listState = "empty-focus";
  }

  const setStatusPage = (status: TaskStatus, page: number) => {
    setPages((current) => ({ ...current, [status]: page }));
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setLabelId("");
    setSprintId("");
    setPriority("");
  };

  const changeTaskStatus = async (task: Task, status: TaskStatus) => {
    if (pendingId || task.status === status) return;
    setActionError("");
    setPendingId(task._id);
    try {
      await updateTask(task._id, { ...toUpdateBody(task), status });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update task status."));
    } finally {
      setPendingId(null);
    }
  };

  return {
    focus,
    setFocus,
    layout,
    setLayout,
    searchInput,
    setSearchInput,
    labelId,
    setLabelId,
    sprintId,
    setSprintId,
    priority,
    setPriority,
    hasFilters,
    clearFilters,
    countByStatus,
    openCount,
    doneCount: countByStatus.done,
    projectTotal,
    slices,
    listState,
    pendingId,
    actionError,
    setStatusPage,
    changeTaskStatus,
  };
}

export type ProjectTaskBrowser = ReturnType<typeof useProjectTaskBrowser>;
