# Projects module implementation roadmap

## 1. Purpose and scope

Projects are named, user-owned buckets for related tasks that exist independently
of sprint planning. They provide the fourth task view in Quillo:

- backlog: tasks with no sprint and no doing date;
- daily: tasks filtered by `doing_date`;
- sprint: tasks filtered by `sprint_id`;
- project: tasks filtered by `project_id`.

A project does not own a separate task collection. Its detail screen must query
the existing tasks endpoint with `project_id=<project id>`. A task may be in a
project and a sprint and may also have a doing date.

The v1 feature should provide:

- project list, create, edit, status filtering, pagination, and delete;
- a project detail screen showing the tasks assigned to that project;
- creation, editing, moving, assigning, and unassigning project tasks;
- consistent desktop and mobile navigation;
- reuse of the existing task forms and task renderers.

Do not add project notes, project statistics, sorting, dashboards, or a separate
client-side project-task store in v1.

## 2. API contract to preserve

The shared project API layer has already been added. Verify it before building UI:

- `src/shared/types.ts`
- `src/shared/endpoints/routes.ts`
- `src/shared/endpoints/modules/projects.ts`
- `src/shared/endpoints/modules/index.ts`
- `src/shared/endpoints/index.ts`
- `src/shared/hooks/keys.ts`
- `src/shared/hooks/useProjectsApi.ts`
- `src/shared/hooks/index.ts`

### Project shape

```ts
interface Project {
  _id: string;
  user_id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "archived";
  color: string;
  created_at: string;
  updated_at: string;
}
```

### Routes

- `POST /projects` creates a project and returns `201 Project`.
- `GET /projects` returns `{ items, page, limit, total }`.
- `GET /projects/:id` returns one project.
- `PUT /projects/:id` updates one project and returns the complete project.
- `DELETE /projects/:id` returns `204` with no response body.
- Every route requires the JWT and is scoped to the authenticated user.

The list accepts `page`, `limit`, and an optional `status`. The API defaults to
12 items, caps `limit` at 250, and returns newest projects first.

### Validation and business rules

- `name` is required, trimmed by the API, and limited to 1–200 characters.
- `color` is required and must be `#RGB` or `#RRGGBB`.
- `description` is optional and may contain long Markdown.
- `status` is `active`, `completed`, or `archived`; create defaults to `active`.
- Project names are not documented as unique. Do not add uniqueness UI rules.
- Project updates use `PUT`; send the complete editable resource state.
- A task has zero or one `project_id`.
- Completing or archiving a project keeps all task associations.
- Deleting a project sets its tasks' `project_id` to `null`; it does not delete
  those tasks.
- Assigning a project does not change `sprint_id` or `doing_date`.
- Send `project_id: null` when explicitly unassigning a task.

## 3. Architecture and implementation rules

- Keep all HTTP access in `src/shared`; components call module hooks only.
- Follow the existing feature structure used by `components/goals` and
  `components/sprints`: thin route, thin view component, view-model hook, focused
  display components, form hook, form component, helpers, and barrel exports.
- Reuse `PageHeader`, `Modal`, `ConfirmModal`, `Table`, `Markdown`,
  `MarkdownEditor`, `TaskDayCards`, and `TaskKanbanBoard`.
- Reuse `TaskForm` for project tasks. Do not fork a project-specific task form.
- Use `queryKeys.projects` and `queryKeys.tasks` for cache ownership.
- Preserve full task bodies on `PUT` by starting with the task
  `toUpdateBody(task)` helper and overriding only `project_id` or another changed
  field.
- Keep server state in React Query. Local state is only for filters, pagination,
  view mode, forms, selections, and pending actions.
- Use accessible labels, keyboard-operable rows/options, and the existing
  loading/error/empty-state language patterns.

## 4. Phase 1 — verify the shared data layer

Before adding screens:

1. Fix `src/components/tasks/helpers.ts` before exposing project assignment:
   add `project_id: task.project_id` to `toUpdateBody(task)`. This is a critical
   prerequisite because the API uses full-resource task `PUT`s; without it,
   existing status changes, scheduling actions, sprint assignment, and ordinary
   edits can silently clear a task's project membership.
2. Audit every task update call to confirm it starts from the corrected
   `toUpdateBody(task)` or otherwise includes `project_id`.
3. Confirm `PROJECT_STATUSES`, `ProjectStatus`, `Project`,
   `CreateProjectBody`, `UpdateProjectBody`, and `ProjectListQuery` match the API.
4. Confirm `ROUTES.projects.base` and `ROUTES.projects.byId` generate
   `/projects` and `/projects/:id`.
5. Confirm `projectsModule` defines authenticated create/list/get/update/delete
   endpoints with the correct typed body, query, params, and response.
6. Confirm `queryKeys.projects` provides `all`, `list(query)`, and `detail(id)`.
7. Confirm `useProjectsApi` exposes:
   - `useProjectsList(query)`;
   - `useProject(id, enabled)`;
   - `createProject(body)`;
   - `updateProject(id, body)`;
   - `deleteProject(id)`;
   - mutation pending flags.
8. Keep project mutations invalidating project queries. Deletion must also
   invalidate task queries because the API clears affected `project_id` values.
9. Run lint on these shared files before building UI so contract errors are
   isolated from screen work.

## 5. Phase 2 — add routes, navigation, and feature structure

Create:

```text
src/app/projects/
  page.tsx
  [slug]/
    page.tsx
  Steps.md

src/components/projects/
  index.ts
  helpers.ts
  ProjectsView.tsx
  ProjectsList.tsx
  ProjectDetail.tsx
  ProjectTasks.tsx
  ProjectDetailModals.tsx
  AddTasksToProjectModal.tsx
  form/
    ProjectForm.tsx
    useProjectForm.ts
  hooks/
    useProjectsListView.ts
    useProjectDetail.ts
    useAddTasksToProject.ts
```

Implementation details:

1. Make `src/app/projects/page.tsx` a client route that renders
   `ProjectsView`.
2. Make `src/app/projects/[slug]/page.tsx` read the route parameter and render
   `ProjectDetail` with the project id. Match the async params convention used
   by the existing goal and sprint detail routes.
3. Export only route-facing components from `src/components/projects/index.ts`.
4. Add `{ href: "/projects", label: "Projects", ... }` to
   `src/components/layout/constants.ts` with an appropriate Lucide icon.
5. Keep Projects out of `MOBILE_PRIMARY_NAV_ITEMS` by setting
   `is_primary: false`; it remains available in the mobile drawer without
   crowding the bottom navigation.
6. Check active-route behavior on both `/projects` and `/projects/:id`.

## 6. Phase 3 — project helpers and CRUD form

### `helpers.ts`

Add:

- `PROJECT_STATUS_LABELS`;
- `PROJECT_STATUS_BADGE_CLASS` and `PROJECT_STATUS_DOT_CLASS`;
- `PROJECT_STATUS_OPTIONS`, sourced from `PROJECT_STATUSES`;
- `projectHref(projectOrId)` returning `/projects/:id`;
- `toUpdateBody(project)` returning `name`, `description`, `status`, and `color`;
- a safe helper for the visual color swatch if needed.

Do not use arbitrary project colors as text/background utility class names.
Render the user color through a small inline `style={{ backgroundColor: color }}`
swatch after the value has come from the validated API.

### `form/useProjectForm.ts`

Support modes:

```ts
type ProjectFormMode =
  | { type: "create" }
  | { type: "edit"; project: Project };
```

The hook should:

1. Initialize name, description, color, and status from the edited project.
2. Use a sensible valid hex default for new projects.
3. Trim name before submission.
4. Validate a non-empty name and `#RGB`/`#RRGGBB` color before calling the API.
5. Create with name, description, color, and default active status.
6. Update with the full editable project state.
7. Convert API errors with `getErrorMessage`.
8. Expose one `pending` value derived from create/update/delete states.
9. Delete only in edit mode and report `{ deleted: true }` to the parent.

### `form/ProjectForm.tsx`

Build a controlled form containing:

- required name input with `maxLength={200}`;
- Markdown description editor;
- color input/picker that always stores a valid hex value;
- status select in edit mode;
- inline error text;
- cancel and save controls with pending labels;
- edit-only delete control.

The delete confirmation must explain the API behavior, for example:
“Delete ‘Project name’? Its tasks will remain, but they will no longer belong
to a project.”

## 7. Phase 4 — projects list

### `hooks/useProjectsListView.ts`

Follow `useGoalsListView`:

1. Use a page size of 50.
2. Store `statusFilter`, `page`, and `projectFormMode` locally.
3. Build `ProjectListQuery` with status only when a filter is selected.
4. Reset to page 1 when status changes.
5. Derive projects, total, total pages, loading, fetching, error, and empty state.
6. Open and close create mode from the page and close it after a successful save.

### `ProjectsView.tsx` and `ProjectsList.tsx`

1. Keep `ProjectsView` thin: call `useProjectsListView` and pass its result to
   `ProjectsList`.
2. Render a “Projects” `PageHeader`, short product description, and “New project”
   action.
3. Add a status filter with All, Active, Completed, and Archived.
4. Show the total project count.
5. Render each project with:
   - color swatch;
   - name;
   - truncated description or a clear “No description” fallback;
   - status badge.
6. Make each row navigate to `projectHref(project)`.
7. Include consistent loading, request error, no-projects, and no-results states.
8. Add previous/next pagination controls disabled while fetching.
9. Host the create `ProjectForm` in a modal.

## 8. Phase 5 — project detail and project task view

### `hooks/useProjectDetail.ts`

Given a `projectId`, load:

- `useProject(projectId)`;
- `useTasksList({ page, limit: 50, project_id: projectId })`;
- labels for task rendering;
- sprint and project catalogs needed by `TaskForm`.

Manage:

- page and table/board mode;
- project edit modal;
- task create/edit modal;
- add-existing-tasks modal;
- pending task id and action error;
- redirect to `/projects` after project deletion.

Actions:

1. `openCreateTask(parent?)` creates a task form mode prefilled with
   `projectId`; propagate the parent id/title when creating a subtask.
2. `openEditTask(task)` uses the shared edit mode.
3. `changeTaskStatus(task, status)` sends
   `{ ...toTaskUpdateBody(task), status }`.
4. Close modals after successful operations.
5. Keep failures visible and clear stale errors before retrying.

### `ProjectDetail.tsx`

1. Render explicit loading, request-error, and not-found states.
2. Use `PageHeader` with a back link to `/projects`.
3. Show project name, color swatch, status badge, Markdown description, and an
   edit action.
4. Add an “Add tasks” action that opens the existing-task selector.
5. Render `ProjectTasks` and `ProjectDetailModals`.
6. After deletion, return to the projects list; never imply that tasks were
   deleted.

### `ProjectTasks.tsx`

1. Label the section “Tasks in this project” and display the API total.
2. Reuse the sprint task view toggle and existing task renderers:
   - `TaskDayCards` for table/list mode;
   - `TaskKanbanBoard` for board mode.
3. Wire edit, status change, done toggle, delete-through-edit, and subtask
   creation consistently with sprint tasks.
4. Render task loading, error, action error, and empty states.
5. In the empty state, offer Add tasks and New task actions.
6. Render project-task pagination when more than 50 tasks exist.

## 9. Phase 6 — integrate projects into the shared task form

Project assignment must be available wherever tasks are created or edited, not
only from a project screen.

### Task form state and request bodies

Update `src/components/tasks/form/useTaskForm.ts`:

1. First update `src/components/tasks/helpers.ts` so `toUpdateBody(task)`
   includes `project_id: task.project_id`; this protects every existing task
   update path, not only submissions made through `TaskForm`.
2. Add `projectId?: RecordId | null` to create mode.
3. Initialize local `projectId` from the edited task or create-mode default.
4. Include `project_id` in create bodies.
5. Include `project_id: projectId || null` in edit bodies.
6. When creating a subtask from an existing task, carry the parent’s
   `project_id`, just as sprint/date context is currently carried.
7. Continue merging edits over `toUpdateBody(editing)` so unrelated links are
   never erased by a full `PUT`.

Update `TaskForm.tsx`, `TaskMetaFields.tsx`, and `TaskEditMetaFields.tsx`:

1. Add `projects: Project[]` to the form props.
2. Pass project state and change handlers through the meta-field components.
3. Add a Project select with a `None` option.
4. Show the project selector for root task creation and editing.
5. Keep the shorter subtask-create UI unchanged while inheriting project context.
6. Pass `projects` recursively to nested `TaskForm` instances.

### Supply project catalogs to every TaskForm host

Load `useProjectsList({ page: 1, limit: 250 })` and pass its items into
`TaskForm` from:

- `src/components/tasks/BacklogView.tsx`;
- `src/components/tasks/useTasksDayView.ts` and `tasks-view/TasksViewModals.tsx`;
- `src/components/tasks/add-day-tasks/useDayTaskListActions.ts`;
- `src/components/tasks/add-day-tasks/AddDayTasksPanel.tsx`;
- `src/components/tasks/add-day-tasks/CreateDayTaskModal.tsx`;
- `src/components/sprints/hooks/useSprintDetail.ts`;
- `src/components/sprints/SprintDetailModals.tsx`;
- the new project-detail view.

Where a parent view already owns catalog loading, add projects there instead of
issuing duplicate queries in each modal. Treat catalog errors separately from
the task list: a task should remain readable even if the assignment catalog
fails. If `total > items.length`, note in the selector that only the first 250
projects are available; do not silently imply the list is complete.

## 10. Phase 7 — assign existing tasks to a project

There is no bulk project-assignment endpoint. Do not use
`POST /tasks/assign-to-sprint` and do not add a client endpoint the API does not
provide.

### `hooks/useAddTasksToProject.ts`

Model this on `useAddTasksToSprint`, with these differences:

1. Load up to 100 tasks and flatten parent/child results without duplicates.
2. Exclude tasks already assigned to the current project.
3. Search locally by title, task number, or `#task_number`.
4. Keep selected ids in a `Set<RecordId>`.
5. Map project ids to names so each option can display “Unassigned” or
   “Currently in Project name”.
6. On submit, process selected tasks sequentially:

```ts
await updateTask(task._id, {
  ...toTaskUpdateBody(task),
  project_id: projectId,
});
```

7. Collect failures. If all updates succeed, close the modal. If any fail, keep
   the modal open, remove successful ids from the selection, and show how many
   tasks could not be moved so retrying does not repeat successful work.
8. Disable selection and submission while assignments are running.
9. Show that the first 100 tasks are displayed when the API total is larger.

### `AddTasksToProjectModal.tsx`

Build an accessible multi-select modal with:

- search field;
- New task action;
- select/clear visible controls;
- selected count;
- task number, title, status, and current project context;
- loading, error, no-task, no-match, truncated-list, and assignment-error states;
- dynamic “Add N tasks” submit label.

Moving a task from another project is allowed and should be stated clearly. It
must not change that task’s sprint or doing date.

## 11. Phase 8 — cache and cross-screen behavior

1. Project create/update/delete invalidates `queryKeys.projects.all`.
2. Project deletion also invalidates `queryKeys.tasks.all`.
3. Task create/update/delete and project assignment invalidate
   `queryKeys.tasks.all`.
4. Do not optimistically remove tasks unless rollback behavior is implemented;
   invalidation after confirmed API success is sufficient for v1.
5. Verify that editing a task’s project refreshes:
   - the open project detail;
   - backlog/daily/sprint views where the same task may also appear;
   - any other cached task list.
6. Project list data needs no invalidation after ordinary task edits because v1
   does not display task counts in project rows.

## 12. Verification checklist

### Static checks

- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Fix all new TypeScript, ESLint, and Next.js route errors.
- [ ] Confirm no component calls Axios or `request()` directly.
- [ ] Confirm `toUpdateBody(task)` includes `project_id` before testing any
  project workflow.
- [ ] Search all task `PUT` call sites and confirm each preserves `project_id`.

### Project CRUD

- [ ] Create a project with required name/color and optional Markdown.
- [ ] Confirm create defaults to Active.
- [ ] Reject empty names and malformed colors before submitting.
- [ ] Edit name, description, color, and each status.
- [ ] Filter the list by Active, Completed, and Archived.
- [ ] Verify list pagination and status-change page reset.
- [ ] Verify duplicate names are allowed by the UI.
- [ ] Delete a project and confirm its tasks still exist and become unassigned.

### Project detail and tasks

- [ ] Open project detail from the list and through a copied URL.
- [ ] Verify loading, missing-id, unauthorized/session-expired, and generic error
  states.
- [ ] Confirm only tasks with the matching `project_id` are rendered.
- [ ] Switch between list/table and board views.
- [ ] Change task status and toggle done.
- [ ] Create a root task from project detail and confirm the project is prefilled.
- [ ] Create a subtask and confirm project context is inherited.
- [ ] Edit a task and move it to another project.
- [ ] Set Project to None and confirm it disappears from the project view.
- [ ] Assign one and multiple existing tasks.
- [ ] Retry a partial assignment failure without moving successful tasks again.
- [ ] Confirm task pagination and the 100-task assignment truncation notice.

### Cross-feature behavior

- [ ] Assign one task to both a project and a sprint.
- [ ] Confirm project assignment does not clear sprint or doing date.
- [ ] Confirm project completion/archive does not alter its tasks.
- [ ] Edit project assignment from daily, backlog, and sprint task forms.
- [ ] Confirm deleting a sprint does not affect `project_id`.
- [ ] Confirm deleting a project does not affect `sprint_id` or delete tasks.

### Responsive and accessibility checks

- [ ] Confirm Projects appears in desktop navigation and the mobile drawer.
- [ ] Confirm `/projects/:id` keeps Projects highlighted in navigation.
- [ ] Check list, detail, forms, and modals at phone and desktop widths.
- [ ] Verify modal focus, close controls, field labels, row keyboard behavior,
  disabled pending states, and visible errors.
- [ ] Verify project color swatches remain understandable alongside text labels
  and are not the only status indicator.

There is currently no automated test framework in this repository. Do not add
one only for this module. If a test setup is introduced before implementation,
add focused tests for request-body builders, project helpers, task project
assignment, partial-failure handling, and status-filter pagination.
