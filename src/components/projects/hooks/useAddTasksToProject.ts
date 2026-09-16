"use client";

import { useMemo, useState } from "react";
import { toUpdateBody as toTaskUpdateBody } from "@/components/tasks/helpers";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
import type { Project, RecordId, Task } from "@/shared/types";

const PAGE_LIMIT = 100;

const flattenTasks = (tasks: Task[]): Task[] => {
  const seen = new Set<RecordId>();
  const result: Task[] = [];
  const visit = (task: Task) => {
    if (seen.has(task._id)) return;
    seen.add(task._id);
    result.push(task);
    task.children?.forEach(visit);
  };
  tasks.forEach(visit);
  return result;
};

export function useAddTasksToProject(
  projectId: RecordId,
  projects: Project[],
  onClose: () => void,
) {
  const { useTasksList, updateTask } = useTasksApi();
  const tasksQuery = useTasksList({ page: 1, limit: PAGE_LIMIT });
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<RecordId>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const projectNames = useMemo(
    () => new Map(projects.map((project) => [project._id, project.name])),
    [projects],
  );

  const available = useMemo(
    () =>
      flattenTasks(tasksQuery.data?.items ?? []).filter(
        (task) => task.project_id !== projectId,
      ),
    [projectId, tasksQuery.data?.items],
  );
  const normalized = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      available.filter((task) => {
        const number = String(task.task_number);
        return (
          !normalized ||
          task.title.toLowerCase().includes(normalized) ||
          number.includes(normalized) ||
          `#${number}`.includes(normalized)
        );
      }),
    [available, normalized],
  );
  const visibleIds = useMemo(() => visible.map((task) => task._id), [visible]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const toggle = (id: RecordId) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAllVisible = () =>
    setSelectedIds((current) => {
      const next = new Set(current);
      visibleIds.forEach((id) =>
        allVisibleSelected ? next.delete(id) : next.add(id),
      );
      return next;
    });
  const currentProjectLabel = (task: Task) => {
    const defaultOutput = "another project";
    if (!task?.project_id) return defaultOutput;

    const projectName =
      typeof task?.project_id === "object"
        ? task.project_id?.name || defaultOutput
        : defaultOutput;
    if (projectName) return projectName ?? defaultOutput;

    return projectNames.get(task.project_id as string) ?? defaultOutput;
  };

  const onSubmit = async () => {
    if (!selectedIds.size || pending) return;
    setPending(true);
    setError("");
    const failures = new Set<RecordId>();
    const selectedTasks = available.filter((task) => selectedIds.has(task._id));
    for (const task of selectedTasks) {
      try {
        await updateTask(task._id, {
          ...toTaskUpdateBody(task),
          project_id: projectId,
        });
      } catch {
        failures.add(task._id);
      }
    }
    setPending(false);
    if (!failures.size) return onClose();
    setSelectedIds(failures);
    setError(
      getErrorMessage(
        null,
        `${failures.size} task${failures.size === 1 ? "" : "s"} could not be moved. Successful tasks were removed from the selection.`,
      ),
    );
  };

  return {
    search,
    setSearch,
    selectedIds,
    selectedCount: selectedIds.size,
    visible,
    allVisibleSelected,
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    isEmpty:
      !tasksQuery.isLoading && !tasksQuery.isError && available.length === 0,
    isFilterEmpty:
      !tasksQuery.isLoading &&
      !tasksQuery.isError &&
      available.length > 0 &&
      visible.length === 0,
    isTruncated: (tasksQuery.data?.total ?? 0) > PAGE_LIMIT,
    pending,
    error,
    toggle,
    toggleAllVisible,
    currentProjectLabel,
    onSubmit,
  };
}
