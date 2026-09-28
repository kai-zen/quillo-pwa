"use client";

import { FormEvent, useReducer, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/shared/errors";
import { useTasksApi } from "@/shared/hooks";
import type { RecordId, Task, TaskPriority, TaskStatus } from "@/shared/types";
import { toUpdateBody } from "../helpers";
import {
  buildTaskFormBody,
  createTaskFormFieldsState,
  resolveLiveTask,
  taskFormFieldsReducer,
  type TaskFormFieldsState,
  type TaskFormMode,
} from "./helpers";

export type { TaskFormMode };

export const useTaskForm = (mode: TaskFormMode, onSaved: () => void) => {
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
  const liveTask = resolveLiveTask(queryClient, editing);
  const isSubtaskCreate = mode.type === "create" && !!mode.parentId;
  const parentTitle = mode.type === "create" ? (mode.parentTitle ?? "") : "";

  const [fields, dispatch] = useReducer(
    taskFormFieldsReducer,
    { mode, editing },
    ({ mode, editing }) => createTaskFormFieldsState(mode, editing),
  );

  const [labelManagerOpen, setLabelManagerOpen] = useState(false);
  const [labelDraftName, setLabelDraftName] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;

  const updateFields = (patch: Partial<TaskFormFieldsState>) =>
    dispatch({ type: "update", patch });

  const setTitle = (value: string) => updateFields({ title: value });
  const setDescription = (value: string) => updateFields({ description: value });
  const setPriority = (value: TaskPriority) => updateFields({ priority: value });
  const setStatus = (value: TaskStatus) => updateFields({ status: value });
  const setLabelIds = (value: RecordId[]) => updateFields({ labelIds: value });
  const setSprintId = (value: RecordId | "") => updateFields({ sprintId: value });
  const setProjectId = (value: RecordId | "") =>
    updateFields({ projectId: value });
  const setDoingDate = (value: string) => updateFields({ doingDate: value });

  const openLabelCreate = (draftName: string) => {
    setLabelDraftName(draftName);
    setLabelManagerOpen(true);
  };

  const closeLabelManager = () => setLabelManagerOpen(false);

  const onLabelCreated = (id: RecordId) =>
    dispatch({ type: "labelCreated", id });

  const onLabelDeleted = (id: RecordId) =>
    dispatch({ type: "labelDeleted", id });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const body = buildTaskFormBody({ mode, fields, editing, isSubtaskCreate });
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
    title: fields.title,
    setTitle,
    description: fields.description,
    setDescription,
    priority: fields.priority,
    setPriority,
    status: fields.status,
    setStatus,
    labelIds: fields.labelIds,
    setLabelIds,
    sprintId: fields.sprintId,
    setSprintId,
    projectId: fields.projectId,
    setProjectId,
    doingDate: fields.doingDate,
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
};
