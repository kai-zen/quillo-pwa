"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
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
import type { TaskFormMode } from "../form/TaskForm";
import { toUpdateBody } from "../helpers";

const PAGE_LIMIT = 50;

export function useDayTaskListActions(doingDate: string) {
  const queryClient = useQueryClient();
  const { useTasksList, updateTask, deleteTask, sortDailyTasks } =
    useTasksApi();
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();
  const reorderGen = useRef(0);

  const [formMode, setFormMode] = useState<TaskFormMode | null>(null);
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const [pendingId, setPendingId] = useState<RecordId | null>(null);
  const [actionError, setActionError] = useState("");

  const listQuery: TaskListQuery = useMemo(
    () => ({
      page: 1,
      limit: PAGE_LIMIT,
      doing_date: doingDate,
    }),
    [doingDate],
  );

  const tasksQuery = useTasksList(listQuery);
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });

  const tasks: Task[] = tasksQuery.data?.items ?? [];
  const labels: Label[] = labelsQuery.data?.items ?? [];
  const sprints: Sprint[] = sprintsQuery.data?.items ?? [];

  const isLoading =
    tasksQuery.isLoading || labelsQuery.isLoading || sprintsQuery.isLoading;
  const isError = tasksQuery.isError;

  const openEdit = (task: Task) => setFormMode({ type: "edit", task });

  const openCreateSubtask = (parent: Task) => {
    setFormMode({
      type: "create",
      parentId: parent._id,
      parentTitle: parent.title,
      doingDate,
    });
  };

  const closeForm = () => setFormMode(null);

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

  const confirmDelete = async () => {
    if (!toDelete || pendingId) return;
    const task = toDelete;
    setToDelete(null);
    await removeTask(task);
  };

  const reorderTasks = useCallback(
    async (orderedIds: RecordId[]) => {
      if (orderedIds.length < 2) return;

      const key = queryKeys.tasks.list(listQuery);
      const gen = ++reorderGen.current;

      queryClient.setQueryData(
        key,
        (current: PaginatedResponse<Task> | undefined) => {
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
        },
      );

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
    [listQuery, queryClient, sortDailyTasks],
  );

  return {
    tasks,
    labels,
    sprints,
    isLoading,
    isError,
    pendingId,
    actionError,
    formMode,
    toDelete,
    setToDelete,
    openEdit,
    openCreateSubtask,
    closeForm,
    confirmDelete,
    toggleDone,
    reorderTasks,
  };
}
