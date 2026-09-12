"use client";

import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
import { queryKeys } from "@/shared/hooks/keys";
import type {
  CreateTaskBody,
  PaginatedResponse,
  RecordId,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskBody,
} from "@/shared/types";
import { groupTasks, toDateInputValue, toUpdateBody } from "../helpers";

export type TaskFormMode =
  | {
      type: "create";
      parentId?: RecordId | null;
      parentTitle?: string;
      sprintId?: RecordId | null;
      projectId?: RecordId | null;
      doingDate?: string | null;
    }
  | { type: "edit"; task: Task };

export function useTaskForm(mode: TaskFormMode, onSaved: () => void) {
  const {
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTasksApi();
  const queryClient = useQueryClient();

  const editing = mode.type === "edit" ? mode.task : null;
  const taskId = editing?._id;

  let liveTask = editing;
  if (taskId) {
    const listQueries = queryClient.getQueriesData<PaginatedResponse<Task>>({
      queryKey: queryKeys.tasks.list(),
    });
    
    for (const [, data] of listQueries) {
      if (!data) continue;
      const grouped = groupTasks(data.items);
      const foundGroup = grouped.find((g) => g.task._id === taskId);
      if (foundGroup) {
        liveTask = { ...foundGroup.task, children: foundGroup.children };
        break;
      }
    }
  }

  const isSubtaskCreate = mode.type === "create" && !!mode.parentId;
  const parentTitle = mode.type === "create" ? (mode.parentTitle ?? "") : "";

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(
    editing?.priority ?? "unset",
  );
  const [status, setStatus] = useState<TaskStatus>(editing?.status ?? "todo");
  const [labelIds, setLabelIds] = useState<RecordId[]>(
    editing?.label_ids ?? [],
  );
  const [sprintId, setSprintId] = useState<RecordId | "">(
    editing?.sprint_id ?? "",
  );
  const [projectId, setProjectId] = useState<RecordId | "">(
    editing?.project_id ??
      (mode.type === "create" ? (mode.projectId ?? "") : ""),
  );
  const initialDoingDate =
    editing?.doing_date ??
    (mode.type === "create" ? (mode.doingDate ?? null) : null);
  const [doingDate, setDoingDate] = useState(
    toDateInputValue(initialDoingDate),
  );
  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [labelDraftName, setLabelDraftName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;

  const openLabelCreate = (draftName: string) => {
    setLabelDraftName(draftName);
    setLabelManagerOpen(true);
  };

  const closeLabelManager = () => setLabelManagerOpen(false);

  const onLabelCreated = (id: RecordId) => {
    setLabelIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const onLabelDeleted = (id: RecordId) => {
    setLabelIds((current) => current.filter((item) => item !== id));
  };

  const buildBody = (): CreateTaskBody | UpdateTaskBody => {
    if (mode.type === "create") {
      return {
        title: title.trim(),
        description: description.trim(),
        label_ids: labelIds,
        status: "todo",
        sprint_id: mode.sprintId ?? null,
        project_id: projectId || null,
        parent_id: mode.parentId ?? null,
        ...(isSubtaskCreate
          ? {}
          : {
              priority,
              doing_date: doingDate || null,
            }),
      };
    }

    return {
      title: title.trim(),
      priority,
      status,
      description: description.trim(),
      label_ids: labelIds,
      sprint_id: sprintId || null,
      project_id: projectId || null,
      doing_date: doingDate || null,
      parent_id: editing?.parent_id ?? null,
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const body = buildBody();
    if (!body.title) {
      setError("Title is required.");
      return;
    }

    try {
      if (editing) {
        await updateTask(editing._id, {
          ...toUpdateBody(editing),
          ...body,
        });
      } else {
        await createTask(body);
      }
      onSaved();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing
            ? "Could not update task."
            : isSubtaskCreate
              ? "Could not create subtask."
              : "Could not create task.",
        ),
      );
    }
  };

  const onDelete = async () => {
    if (!editing) return;

    setError("");
    try {
      await deleteTask(editing._id);
      setDeleteConfirmOpen(false);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete task."));
    }
  };

  const onDeleteSubtask = async (task: Task) => {
    try {
      await deleteTask(task._id);
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete subtask."));
    }
  };

  const onToggleSubtaskDone = async (task: Task) => {
    try {
      const newStatus = task.status === "done" ? "todo" : "done";
      await updateTask(task._id, {
        ...toUpdateBody(task),
        status: newStatus,
      });
    } catch (err) {
      setError(getErrorMessage(err, "Could not update subtask."));
    }
  };

  const childrenTasks = liveTask?.children || [];

  return {
    editing: liveTask,
    isSubtaskCreate,
    parentTitle,
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    status,
    setStatus,
    labelIds,
    setLabelIds,
    sprintId,
    setSprintId,
    projectId,
    setProjectId,
    doingDate,
    setDoingDate,
    labelManagerOpen,
    labelDraftName,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    error,
    pending,
    openLabelCreate,
    closeLabelManager,
    onLabelCreated,
    onLabelDeleted,
    onSubmit,
    onDelete,
    onDeleteSubtask,
    onToggleSubtaskDone,
    childrenTasks,
  };
}
