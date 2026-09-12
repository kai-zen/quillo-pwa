# Quillo PWA

Frontend for a **personal** task manager. It uses a few Scrum ideas (backlog, sprints) without the rest of Scrum.

This is version 1. Keep the product small. The API contract lives in the sibling `api` repo; this app consumes it.

## Goal

Let one person keep tasks, group related work into projects, categorize it with labels, optionally put it in a sprint, optionally tie sprints to a goal, and optionally schedule tasks for a day.

Four ways to look at the same tasks:

- **Backlog** — every task
- **Daily** — tasks for a given day
- **Sprint** — tasks that belong to a given sprint
- **Project** — tasks that belong to a given project

These are filters on `GET /tasks`, not separate screens with separate data stores.

## Design rule

Stay minimal. Do not add UI surface, state, or shared helpers unless a v1 screen needs them.

Twelve domain modules: users, labels, projects, goals, sprints, routines, tasks, note folders, notes, daily reviews, progresses, progress inputs. Match the API. Prefer shared types and one data-access path so components stay thin.

## Stack

- Next.js (App Router) + React + Tailwind
- Axios for HTTP
- TanStack React Query for server state
- JWT stored in `localStorage`, sent as `Authorization: Bearer <token>`

## Data flow

Components do not call Axios directly. Flow is:

```
component
  → module hook (useUsersApi / useLabelsApi / useProjectsApi / useGoalsApi / useSprintsApi / useRoutinesApi / useTasksApi / useNoteFoldersApi / useNotesApi / useDailyReviewsApi / useProgressesApi / useProgressInputsApi)
    → request() + module endpoint def
      → apiClient (Axios)
        → Quillo API
```

### `src/shared/types.ts`

Domain types, request bodies, list queries, and shared shapes (`PaginatedResponse`, enums). Keep this the single source of truth for shapes the UI and API share.

### `src/shared/endpoints`

| File           | Role                                                                        |
| -------------- | --------------------------------------------------------------------------- |
| `routes.ts`    | All path strings / path builders                                            |
| `client.ts`    | Axios instance, auth token helpers, typed `request()`                       |
| `types.ts`     | `EndpointDef` and related endpoint types                                    |
| `modules/*.ts` | One object per domain: method, path, auth, typed body/query/params/response |

Each module entry is a static definition. Example:

```ts
labelsModule.list; // GET /labels → PaginatedResponse<Label>
projectsModule.list; // GET /projects → PaginatedResponse<Project>
goalsModule.toggleObjective; // PATCH /goals/:id/objectives/:objectiveId/toggle → Goal
notesModule.togglePinned; // PATCH /notes/:id/pinned/toggle → Note
notesModule.toggleArchived; // PATCH /notes/:id/archived/toggle → Note
dailyReviewsModule.getByRange; // GET /daily-reviews/range → { items }
dailyReviewsModule.getByDate; // GET /daily-reviews/date/:date → DailyReview
```

Call them through `request(endpoint, { body, query, params })`.

### `src/shared/hooks`

One hook per module. Each returns:

- **Query helpers** — functions named `use…` that take params and return a React Query result (must be called during render)
- **Mutation helpers** — async functions (`mutateAsync`) for create / update / delete / auth

Example:

```ts
const { useTasksList, createTask } = useTasksApi();
const { data, isLoading } = useTasksList({ doing_date: "2026-08-20" });
await createTask({ title: "Ship v1" });
```

`queryKeys` in `hooks/keys.ts` owns cache keys. Mutations invalidate the matching module keys (and related ones when needed, e.g. deleting a label refreshes tasks).

### Providers

`src/components/providers.tsx` wraps the tree with `QueryClientProvider`. Root layout uses it.

## Modules (v1)

Same product model as the API.

### Users

Auth and the current account.

- register / login → `{ token, user }`
- get me / change password / delete me
- delete my data (`DELETE /users/me/data`) — selective cleanup by type: `daily_tasks` (tasks with `doing_date`), `daily_notes` (notes with `date`), `progress_inputs`, `daily_reviews` → `{ deleted }` counts

### Labels

Categories on tasks and notes (`name`, `color`). Unique name per user.

### Projects

Named buckets for related tasks.

- `name`, optional `description`, `color`
- `status` — `active` | `completed` | `archived`
- list may filter by `status`
- deleting a project clears `project_id` from its tasks; tasks stay

### Goals

Longer-term outcomes with embedded objectives (checklist items).

- `title`, `description`, `status` (`active` | `completed` | `cancelled`)
- optional `start_date`, `target_date`
- `objectives[]` — embedded (`_id`, `title`, `description`, `completed`)
- toggle one objective’s `completed` via `PATCH /goals/:id/objectives/:objectiveId/toggle` (no body)
- `GET /goals/:id` also returns `sprints[]` for sprints linked via `goal_id`

### Sprints

Named work buckets with dates and status: `planned` | `active` | `completed` | `archived`.

Optional `goal_id` — link this sprint to a goal. Send `null` on update to clear.

Optional `progress_ids[]` — select which progresses to track during this sprint. Omit on create for none; include on update to replace the full list.

### Routines

Named lists of task drafts. Applying routines for a day creates normal tasks with that `doing_date`.

- `repeat` — `everyday` | `weekly`
- `days_of_week[]` when weekly
- `drafts[]` — templates, not tasks

### Tasks

The work item. Optional `label_ids`, `sprint_id`, `project_id`, `doing_date`, `parent_id`.

Priorities: `unset` | `low` | `medium` | `high` | `urgent`  
Statuses: `todo` | `doing` | `done` | `paused` | `cancelled`

### Note folders

Named buckets for organizing notes (`name`). Unique name per user. A note may belong to one folder, or to none.

### Notes

Independent from the Goal → Sprint → Daily Task hierarchy. Optional links to a folder, labels, a goal, a sprint, and a date.

- `title`, `content`
- `pinned`, `archived`
- optional `folder_id`, `label_ids[]`, `goal_id`, `sprint_id`, `date`
- toggle `pinned` via `PATCH /notes/:id/pinned/toggle` (no body)
- toggle `archived` via `PATCH /notes/:id/archived/toggle` (no body)
- list filters: `folder_id`, `goal_id`, `sprint_id`, `date`, `archived`, `pinned`, `label_ids` (send `"null"` for none)

### Progresses

Reusable tracker definitions. Independent from goals, sprints, and tasks.

- `title`, optional `description`
- `input_type` — `boolean` | `number` | `duration` | `rating` | `choice`
- `choice_options[]` when `input_type` is `choice`
- `number_range` as `[min, max]` when `input_type` is `number` or `rating`
- title unique per user
- updates use full resource bodies (`PUT`)
- `input_type` cannot change after values have been recorded
- deleting a progress also deletes its recorded inputs and removes it from sprint `progress_ids`

### Progress inputs

Daily values for a progress. Independent from tasks.

- `progress_id`, `date`, `value` (`boolean` | `number` | `string`)
- one input per progress per calendar day
- value shape is validated against the linked progress `input_type`
- list: `GET /progress-inputs` with optional `progress_id`, `date`, pagination
- range: `GET /progress-inputs/range?from=&to=` (inclusive, optional `progress_id`)
- one day: `GET /progress-inputs/date/:date` → `{ items }`
- updates use full resource bodies (`PUT`)

### Daily reviews

One journal entry per calendar day. Independent from the Goal → Sprint → Daily Task hierarchy.

- `date`, `journal`, `mood`, `completion` (0 to 100)
- moods: `awful` | `bad` | `sad` | `angry` | `anxious` | `overwhelmed` | `frustrated` | `tired` | `lonely` | `bored` | `okay` | `restless` | `calm` | `good` | `happy` | `grateful` | `proud` | `hopeful` | `excited` | `great`
- list: `GET /daily-reviews` with optional `date`, `mood`
- range: `GET /daily-reviews/range?from=&to=` (inclusive, no pagination)
- one day: `GET /daily-reviews/date/:date`

### Subtasks

One nesting level only. Parent/child `done` is linked on the API; the UI just sends status updates.

## How the views work

| View    | Rule                                |
| ------- | ----------------------------------- |
| Backlog | `GET /tasks` with no special filter |
| Daily   | `GET /tasks?doing_date=YYYY-MM-DD`  |
| Sprint  | `GET /tasks?sprint_id=<id>`         |
| Project | `GET /tasks?project_id=<id>`        |

A task can appear in more than one view.

## Business rules (UI must respect)

These are enforced by the API. The frontend should not invent conflicting rules.

### Users

- Username is unique and cannot be changed after registration.
- Never display or store `password_hash`.
- On login/register success, persist the JWT; on logout / delete-me / `401`, clear it.
- Selective data delete does not remove the account. `daily_tasks` only deletes dated tasks (clears `parent_id` on leftover subtasks); `daily_notes` only dated notes; `progress_inputs` and `daily_reviews` wipe those collections for the user. Progress definitions stay.

### Labels

- Name unique per user.
- Deleting a label does not delete tasks or notes; label ids are cleared from tasks, routine drafts, and notes.

### Projects

- A task may belong to zero or one project.
- Completing or archiving a project keeps task associations.
- Deleting a project clears `project_id` on its tasks; tasks stay.

### Goals

- Objectives are embedded. Create, update, and remove them through goal create/update, except toggling `completed` (dedicated PATCH route).
- `start_date` must be before or equal to `target_date` when both are set.
- Deleting a goal clears `goal_id` on sprints and notes that pointed at it. Sprints and notes stay.

### Sprints

- A sprint may belong to zero or one goal.
- `progress_ids` must reference progresses owned by the user. Duplicates are ignored.
- `start_date` ≤ `end_date`.
- Deleting a sprint clears `sprint_id` on tasks and notes; tasks and notes stay.
- Archive keeps task associations.

### Routines

- Name unique per user.
- Applying a routine creates new tasks; it does not update existing ones.
- Deleting a routine does not delete tasks created from it.

### Tasks

- Updates use full resource bodies (`PUT`), including `null` to clear `sprint_id`, `project_id`, `doing_date`, or `parent_id`.
- `project_id`, if set, must reference a project owned by the user.
- Subtasks cannot have subtasks.
- Deleting a task clears `parent_id` on its children; children stay.

### Note folders

- Name unique per user.
- Deleting a folder clears `folder_id` on notes; notes stay.

### Notes

- Updates use full resource bodies (`PUT`), including `null` to clear `folder_id`, `goal_id`, `sprint_id`, or `date`.
- Toggle pin with `PATCH /notes/:id/pinned/toggle` (no body); it only flips `pinned`.
- Toggle archive with `PATCH /notes/:id/archived/toggle` (no body); it only flips `archived`.
- A note does not need a folder, label, or relationship to any other entity.

### Progresses

- Title unique per user.
- `choice_options` is required for `choice`; `number_range` is required for `number` and `rating`.
- Do not send `choice_options` or `number_range` for other input types.
- `number_range` min must be less than max.
- `input_type` cannot change once any input value exists for that progress.
- Deleting a progress deletes its inputs and removes its id from every sprint `progress_ids`. Tasks and other entities stay.

### Progress inputs

- `date` is `YYYY-MM-DD`. `from` must be ≤ `to` on range.
- Only one input per progress per day. Absent input means no answer; do not treat as `false` or `0`.
- Updates use full resource bodies (`PUT`).
- Deleting an input does not affect the progress definition, sprint selection, or tasks.

### Daily reviews

- One review per user per calendar day.
- `date` is `YYYY-MM-DD`. `from` must be ≤ `to` on range.
- Updates use full resource bodies (`PUT`).
- Deleting a review does not affect tasks, notes, or other entities.

## Folder map (v1)

```
src/
  app/                 # Next.js routes and layout
  components/          # Feature UI (tasks, sprints, routines, …)
  shared/
    types.ts           # Domain + request/response types
    endpoints/         # Routes, Axios client, module endpoint defs
    hooks/             # One React Query hook per module
```

Keep API access in `shared` only. Feature folders own screens and forms.
