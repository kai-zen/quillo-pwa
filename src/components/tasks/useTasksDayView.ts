"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import {
  queryKeys,
  useLabelsApi,
  useProjectsApi,
  useSprintsApi,
  useTasksApi,
} from "@/shared/hooks";
import type {
  Label,
  PaginatedResponse,
  Project,
  RecordId,
  Sprint,
  Task,
  TaskListQuery,
  TaskStatus,
} from "@/shared/types";
import type { TaskFormMode } from "./form/TaskForm";
import { buildDayStrip, parseIsoDate, toUpdateBody, todayIso } from "./helpers";

export const TASKS_DATE_PARAM = "date";
export const TASKS_NOTES_PARAM = "notes";

const PAGE_LIMIT = 50;

function selectedDateFromParams(searchParams: URLSearchParams): string {
  const raw = searchParams.get(TASKS_DATE_PARAM);
  if (raw && parseIsoDate(raw)) return raw;
  return todayIso();
}

function showNotesFromParams(searchParams: URLSearchParams): boolean {
  return searchParams.get(TASKS_NOTES_PARAM) === "1";
}

export function useTasksDayView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { useTasksList, updateTask, deleteTask, sortDailyTasks } =
    useTasksApi();
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();
  const { useProjectsList } = useProjectsApi();

  const reorderGen = useRef(0);

  const selectedDate = useMemo(
    () => selectedDateFromParams(searchParams),
    [searchParams],
  );
  const [stripAnchor, setStripAnchor] = useState(selectedDate);

  const showNotes = useMemo(
    () => showNotesFromParams(searchParams),
    [searchParams],
  );

  const stripCenter = useMemo(
    () =>
      buildDayStrip(stripAnchor).includes(selectedDate)
        ? stripAnchor
        : selectedDate,
    [stripAnchor, selectedDate],
  );

  const [formMode, setFormMode] = useState<TaskFormMode | null>(null);
  const [addTasksOpen, setAddTasksOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyTemplateOpen, setApplyTemplateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const [pendingId, setPendingId] = useState<RecordId | null>(null);
  const [actionError, setActionError] = useState("");

  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const projectsQuery = useProjectsList({ page: 1, limit: 250 });
  const tasksQuery = useTasksList({
    page: 1,
    limit: PAGE_LIMIT,
    doing_date: selectedDate,
  });

  const labels: Label[] = labelsQuery.data?.items ?? [];
  const sprints: Sprint[] = sprintsQuery.data?.items ?? [];
  const projects: Project[] = projectsQuery.data?.items ?? [];
  const tasks = tasksQuery.data?.items ?? [];
  const taskTotal = tasksQuery.data?.total ?? 0;

  const isLoading =
    tasksQuery.isLoading || labelsQuery.isLoading || sprintsQuery.isLoading;
  const isError = tasksQuery.isError;
  const isEmpty = !isLoading && !isError && tasks.length === 0;

  const setDateInUrl = useCallback(
    (iso: string) => {
      if (!iso || !parseIsoDate(iso)) return;
      const params = new URLSearchParams(searchParams.toString());
      if (iso === todayIso()) params.delete(TASKS_DATE_PARAM);
      else params.set(TASKS_DATE_PARAM, iso);

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectDate = (iso: string) => {
    setDateInUrl(iso);
  };

  const jumpToDate = (iso: string) => {
    setDateInUrl(iso);
    setStripAnchor((center) =>
      buildDayStrip(center).includes(iso) ? center : iso,
    );
  };

  const toggleNotes = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (showNotes) {
      params.delete(TASKS_NOTES_PARAM);
    } else {
      params.set(TASKS_NOTES_PARAM, "1");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, showNotes]);

  const openAddTasks = () => setAddTasksOpen(true);
  const closeAddTasks = () => setAddTasksOpen(false);

  const openCreate = (parent?: Task, sprintId?: RecordId | null) => {
    if (!parent && sprintId == null) {
      openAddTasks();
      return;
    }

    const projectId =
      parent?.project_id && typeof parent.project_id === "object"
        ? parent.project_id._id
        : (parent?.project_id as string) || null;

    setFormMode({
      type: "create",
      parentId: parent?._id ?? null,
      parentTitle: parent?.title,
      doingDate: selectedDate,
      sprintId: sprintId ?? null,
      projectId,
    });
  };

  const openEdit = (task: Task) => setFormMode({ type: "edit", task });
  const closeForm = () => setFormMode(null);
  const openApply = () => setApplyOpen(true);
  const closeApply = () => setApplyOpen(false);
  const openApplyTemplate = () => setApplyTemplateOpen(true);
  const closeApplyTemplate = () => setApplyTemplateOpen(false);

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

  const requestDelete = (task: Task) => setToDelete(task);
  const clearDelete = () => setToDelete(null);
  const confirmDelete = () => {
    if (!toDelete || pendingId) return;
    const task = toDelete;
    setToDelete(null);
    void removeTask(task);
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
    [queryClient, selectedDate, sortDailyTasks],
  );

  return {
    selectedDate,
    stripCenter,
    selectDate,
    jumpToDate,
    showNotes,
    toggleNotes,
    formMode,
    addTasksOpen,
    labels,
    sprints,
    projects,
    tasks,
    taskTotal,
    isLoading,
    isError,
    isEmpty,
    pendingId,
    actionError,
    openCreate,
    openAddTasks,
    closeAddTasks,
    openEdit,
    closeForm,
    applyOpen,
    openApply,
    closeApply,
    applyTemplateOpen,
    openApplyTemplate,
    closeApplyTemplate,
    toggleDone,
    removeTask,
    toDelete,
    requestDelete,
    clearDelete,
    confirmDelete,
    reorderTasks,
  };
}

export type TasksDayViewModel = ReturnType<typeof useTasksDayView>;
