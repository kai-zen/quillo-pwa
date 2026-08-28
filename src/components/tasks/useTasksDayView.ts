"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import {
  queryKeys,
  useLabelsApi,
  useSprintsApi,
  useTasksApi,
} from "@/shared/hooks";
import type {
  Label,
  PaginatedResponse,
  RecordId,
  Sprint,
  Task,
  TaskListQuery,
  TaskStatus,
} from "@/shared/types";
import type { TaskFormMode } from "./form/TaskForm";
import { buildDayStrip, toUpdateBody, todayIso } from "./helpers";

const PAGE_LIMIT = 50;

export function useTasksDayView() {
  const queryClient = useQueryClient();
  const { useTasksList, updateTask, deleteTask, sortDailyTasks } =
    useTasksApi();
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();
  const reorderGen = useRef(0);

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [stripCenter, setStripCenter] = useState(todayIso);
  const [formMode, setFormMode] = useState<TaskFormMode | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [pendingId, setPendingId] = useState<RecordId | null>(null);
  const [actionError, setActionError] = useState("");

  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const tasksQuery = useTasksList({
    page: 1,
    limit: PAGE_LIMIT,
    doing_date: selectedDate,
  });

  const labels: Label[] = labelsQuery.data?.items ?? [];
  const sprints: Sprint[] = sprintsQuery.data?.items ?? [];
  const tasks = tasksQuery.data?.items ?? [];
  const taskTotal = tasksQuery.data?.total ?? 0;

  const isLoading =
    tasksQuery.isLoading || labelsQuery.isLoading || sprintsQuery.isLoading;
  const isError = tasksQuery.isError;
  const isEmpty = !isLoading && !isError && tasks.length === 0;

  const selectDate = (iso: string) => {
    if (!iso) return;
    setSelectedDate(iso);
  };

  const jumpToDate = (iso: string) => {
    if (!iso) return;
    setSelectedDate(iso);
    if (!buildDayStrip(stripCenter).includes(iso)) {
      setStripCenter(iso);
    }
  };

  const openCreate = (parent?: Task, sprintId?: RecordId | null) => {
    setFormMode({
      type: "create",
      parentId: parent?._id ?? null,
      parentTitle: parent?.title,
      doingDate: selectedDate,
      sprintId: sprintId ?? null,
    });
  };

  const openEdit = (task: Task) => setFormMode({ type: "edit", task });
  const closeForm = () => setFormMode(null);
  const openApply = () => setApplyOpen(true);
  const closeApply = () => setApplyOpen(false);

  const changeStatus = async (task: Task, status: TaskStatus) => {
    if (pendingId || task.status === status) return;
    setActionError("");
    setPendingId(task._id);
    try {
      await updateTask(task._id, {
        ...toUpdateBody(task),
        status,
      });
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update task status."));
    } finally {
      setPendingId(null);
    }
  };

  const toggleDone = (task: Task) =>
    changeStatus(task, task.status === "done" ? "todo" : "done");

  const removeTask = async (task: Task) => {
    if (pendingId) return;
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setActionError("");
    setPendingId(task._id);
    try {
      await deleteTask(task._id);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not delete task."));
    } finally {
      setPendingId(null);
    }
  };

  const reorderTasks = useCallback(
    async (orderedIds: RecordId[]) => {
      if (orderedIds.length < 2) return;

      const query: TaskListQuery = {
        page: 1,
        limit: PAGE_LIMIT,
        doing_date: selectedDate,
      };
      const key = queryKeys.tasks.list(query);
      const gen = ++reorderGen.current;

      queryClient.setQueryData(key, (current: PaginatedResponse<Task> | undefined) => {
        if (!current) return current;
        const orderById = new Map(
          orderedIds.map((id, sort_order) => [id, sort_order]),
        );
        return {
          ...current,
          items: current.items.map((task) => {
            const sort_order = orderById.get(task._id);
            return sort_order === undefined ? task : { ...task, sort_order };
          }),
        };
      });

      setActionError("");
      try {
        await sortDailyTasks({
          items: orderedIds.map((id, sort_order) => ({ id, sort_order })),
        });
      } catch (err) {
        if (gen !== reorderGen.current) return;
        await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        setActionError(getErrorMessage(err, "Could not save task order."));
      }
    },
    [queryClient, selectedDate, sortDailyTasks],
  );

  return {
    selectedDate,
    stripCenter,
    selectDate,
    jumpToDate,
    formMode,
    labels,
    sprints,
    tasks,
    taskTotal,
    isLoading,
    isError,
    isEmpty,
    pendingId,
    actionError,
    openCreate,
    openEdit,
    closeForm,
    applyOpen,
    openApply,
    closeApply,
    toggleDone,
    removeTask,
    reorderTasks,
  };
}

export type TasksDayViewModel = ReturnType<typeof useTasksDayView>;
