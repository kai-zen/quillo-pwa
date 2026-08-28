# Quillo PWA

Frontend for a **personal** task manager. It uses a few Scrum ideas (backlog, sprints) without the rest of Scrum.

This is version 1. Keep the product small. The API contract lives in the sibling `api` repo; this app consumes it.

## Goal

Let one person keep tasks, group them with labels, optionally put them in a sprint, optionally tie sprints to a goal, and optionally schedule tasks for a day.

Three ways to look at the same tasks:

- **Backlog** — every task
- **Daily** — tasks for a given day
- **Sprint** — tasks that belong to a given sprint

These are filters on `GET /tasks`, not separate screens with separate data stores.

## Design rule

Stay minimal. Do not add UI surface, state, or shared helpers unless a v1 screen needs them.

Six domain modules: users, labels, goals, sprints, routines, tasks. Match the API. Prefer shared types and one data-access path so components stay thin.

## Stack

- Next.js (App Router) + React + Tailwind
- Axios for HTTP
- TanStack React Query for server state
- JWT stored in `localStorage`, sent as `Authorization: Bearer <token>`

## Data flow

Components do not call Axios directly. Flow is:

```
component
  → module hook (useUsersApi / useLabelsApi / useGoalsApi / useSprintsApi / useRoutinesApi / useTasksApi)
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
goalsModule.toggleObjective; // PATCH /goals/:id/objectives/:objectiveId/toggle → Goal
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

### Labels

Categories on tasks (`name`, `color`). Unique name per user.

### Goals

Longer-term outcomes with embedded objectives (checklist items).

- `title`, `description`, `status` (`active` | `completed` | `cancelled`)
- optional `start_date`, `target_date`
- `objectives[]` — embedded (`_id`, `title`, `description`, `completed`)
- toggle one objective’s `completed` via `PATCH /goals/:id/objectives/:objectiveId/toggle` (no body)

### Sprints

Named work buckets with dates and status: `planned` | `active` | `completed` | `archived`.

Optional `goal_id` — link this sprint to a goal. Send `null` on update to clear.

### Routines

Named lists of task drafts. Applying routines for a day creates normal tasks with that `doing_date`.

- `repeat` — `everyday` | `weekly`
- `days_of_week[]` when weekly
- `drafts[]` — templates, not tasks

### Tasks

The work item. Optional `label_ids`, `sprint_id`, `doing_date`, `parent_id`.

Priorities: `unset` | `low` | `medium` | `high` | `urgent`  
Statuses: `todo` | `doing` | `done` | `paused` | `cancelled`

### Subtasks

One nesting level only. Parent/child `done` is linked on the API; the UI just sends status updates.

## How the views work

| View    | Rule                                |
| ------- | ----------------------------------- |
| Backlog | `GET /tasks` with no special filter |
| Daily   | `GET /tasks?doing_date=YYYY-MM-DD`  |
| Sprint  | `GET /tasks?sprint_id=<id>`         |

A task can appear in more than one view.

## Business rules (UI must respect)

These are enforced by the API. The frontend should not invent conflicting rules.

### Users

- Username is unique and cannot be changed after registration.
- Never display or store `password_hash`.
- On login/register success, persist the JWT; on logout / delete-me / `401`, clear it.

### Labels

- Name unique per user.
- Deleting a label does not delete tasks; label ids are cleared from tasks and routine drafts.

### Goals

- Objectives are embedded. Create, update, and remove them through goal create/update, except toggling `completed` (dedicated PATCH route).
- `start_date` must be before or equal to `target_date` when both are set.
- Deleting a goal clears `goal_id` on sprints that pointed at it. Sprints stay.

### Sprints

- A sprint may belong to zero or one goal.
- `start_date` ≤ `end_date`.
- Deleting a sprint clears `sprint_id` on tasks; tasks stay.
- Archive keeps task associations.

### Routines

- Name unique per user.
- Applying a routine creates new tasks; it does not update existing ones.
- Deleting a routine does not delete tasks created from it.

### Tasks

- Updates use full resource bodies (`PUT`), including `null` to clear `sprint_id`, `doing_date`, or `parent_id`.
- Subtasks cannot have subtasks.
- Deleting a task clears `parent_id` on its children; children stay.

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
