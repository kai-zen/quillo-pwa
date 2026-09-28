import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/hooks/keys";
import type {
  CreateTaskBody,
  PaginatedResponse,
  Project,
  RecordId,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskBody,
} from "@/shared/types";
import { groupTasks, toDateInputValue } from "../helpers";

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

export type TaskFormFieldsState = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  labelIds: RecordId[];
  sprintId: RecordId | "";
  projectId: RecordId | "";
  doingDate: string;
};

export type TaskFormFieldsAction =
  | { type: "update"; patch: Partial<TaskFormFieldsState> }
  | { type: "labelCreated"; id: RecordId }
  | { type: "labelDeleted"; id: RecordId };

export const getProjectId = (
  project?: Project | string | null,
): RecordId | null => {
  if (!project) return null;
  if (typeof project === "object") return project._id;
  return project as string;
};

export const createTaskFormFieldsState = (
  mode: TaskFormMode,
  editing: Task | null,
): TaskFormFieldsState => {
  const initialDoingDate =
    editing?.doing_date ??
    (mode.type === "create" ? (mode.doingDate ?? null) : null);

  return {
    title: editing?.title ?? "",
    description: editing?.description ?? "",
    priority: editing?.priority ?? "unset",
    status: editing?.status ?? "todo",
    labelIds: editing?.label_ids ?? [],
    sprintId: editing?.sprint_id ?? "",
    projectId:
      getProjectId(editing?.project_id) ??
      (mode.type === "create" ? (mode.projectId ?? "") : ""),
    doingDate: toDateInputValue(initialDoingDate),
  };
};

export const taskFormFieldsReducer = (
  state: TaskFormFieldsState,
  action: TaskFormFieldsAction,
): TaskFormFieldsState => {
  switch (action.type) {
    case "update":
      return { ...state, ...action.patch };
    case "labelCreated":
      return state.labelIds.includes(action.id)
        ? state
        : { ...state, labelIds: [...state.labelIds, action.id] };
    case "labelDeleted":
      return {
        ...state,
        labelIds: state.labelIds.filter((item) => item !== action.id),
      };
    default:
      return state;
  }
};

export const resolveLiveTask = (
  queryClient: QueryClient,
  editing: Task | null,
): Task | null => {
  if (!editing?._id) return editing;

  const listQueries = queryClient.getQueriesData<PaginatedResponse<Task>>({
    queryKey: queryKeys.tasks.list(),
  });

  for (const [, data] of listQueries) {
    if (!data) continue;
    const grouped = groupTasks(data.items);
    const foundGroup = grouped.find((g) => g.task._id === editing._id);
    if (foundGroup) {
      return { ...foundGroup.task, children: foundGroup.children };
    }
  }

  return editing;
};

export const buildTaskFormBody = ({
  mode,
  fields,
  editing,
  isSubtaskCreate,
}: {
  mode: TaskFormMode;
  fields: TaskFormFieldsState;
  editing: Task | null;
  isSubtaskCreate: boolean;
}): CreateTaskBody | UpdateTaskBody => {
  if (mode.type === "create") {
    return {
      title: fields.title.trim(),
      description: fields.description.trim(),
      label_ids: fields.labelIds,
      status: "todo",
      sprint_id: mode.sprintId ?? null,
      project_id: fields.projectId || null,
      parent_id: mode.parentId ?? null,
      ...(isSubtaskCreate
        ? {}
        : {
            priority: fields.priority,
            doing_date: fields.doingDate || null,
          }),
    };
  }

  return {
    title: fields.title.trim(),
    priority: fields.priority,
    status: fields.status,
    description: fields.description.trim(),
    label_ids: fields.labelIds,
    sprint_id: fields.sprintId || null,
    project_id: fields.projectId || null,
    doing_date: fields.doingDate || null,
    parent_id: editing?.parent_id ?? null,
  };
};
