"use client";

import { ListTodo, Plus, StickyNote } from "lucide-react";
import { FC, Suspense } from "react";
import { Button, DatePicker, Modal, PageHeader } from "@/components/common";
import { LinkedNotes, useLinkedNotes } from "@/components/notes";
import { ApplyRoutinesModal } from "@/components/routines";
import { ActiveSprintCard } from "@/components/sprints";
import DayProgress from "./DayProgress";
import DayStrip from "./DayStrip";
import TaskForm, { taskFormTitle } from "./form/TaskForm";
import { formatDayHeading } from "./helpers";
import TaskDayCards from "./TaskDayCards";
import { useTasksDayView } from "./useTasksDayView";

const TasksViewContent: FC = () => {
  const {
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
  } = useTasksDayView();
  const dayNotes = useLinkedNotes({ date: selectedDate });

  const heading = formatDayHeading(selectedDate);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title="Tasks"
        description="Pick a day and work through what you planned to do."
        icon={ListTodo}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              onClick={() => openCreate()}
              size="sm"
              startIcon={<Plus className="h-4 w-4" aria-hidden />}
            >
              Add tasks
            </Button>
          </div>
        }
      />

      <ActiveSprintCard
        sprints={sprints}
        onCreateTask={(sprintId) => openCreate(undefined, sprintId)}
        onEditTask={openEdit}
      />

      <div>
        <DayStrip
          centerDate={stripCenter}
          selectedDate={selectedDate}
          onSelect={selectDate}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DatePicker
          value={selectedDate}
          onChange={jumpToDate}
          clearable={false}
          aria-label="Go to date"
          placeholder="Pick a date…"
        />
        <div>
          <p className="text-sm font-medium tabular-nums">
            {taskTotal} task{taskTotal === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {!isLoading && !isError && tasks.length > 0 && (
        <DayProgress tasks={tasks} />
      )}

      <Modal
        open={!!formMode}
        onClose={closeForm}
        title={formMode ? taskFormTitle(formMode) : ""}
        className="max-w-3xl"
      >
        {formMode && (
          <TaskForm
            key={
              formMode.type === "edit"
                ? formMode.task._id
                : `create-${formMode.parentId ?? "root"}-${selectedDate}`
            }
            mode={formMode}
            labels={labels}
            sprints={sprints}
            onClose={closeForm}
            onSaved={closeForm}
            onCreateSubtask={
              formMode.type === "edit" && !formMode.task.parent_id
                ? () => openCreate(formMode.task)
                : undefined
            }
            onAddFromRoutines={() => {
              closeForm();
              openApply();
            }}
          />
        )}
      </Modal>

      <ApplyRoutinesModal
        open={applyOpen}
        doingDate={selectedDate}
        onClose={closeApply}
      />

      {isLoading && <p className="text-sm text-muted">Loading tasks…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load tasks. Try refreshing the page.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">No tasks for this day</p>
          <p className="mt-1 text-sm text-muted">
            Schedule something for {heading}, or pick another day.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button
              onClick={() => openCreate()}
              startIcon={<Plus className="w-4" aria-hidden />}
            >
              Add tasks
            </Button>
            <Button
              variant="secondary"
              onClick={dayNotes.openCreate}
              startIcon={<StickyNote className="w-4" aria-hidden />}
            >
              Add note
            </Button>
          </div>
        </div>
      )}

      {actionError && <p className="text-sm text-foreground">{actionError}</p>}

      {!isLoading && !isError && tasks.length > 0 && (
        <TaskDayCards
          tasks={tasks}
          labels={labels}
          pendingId={pendingId}
          onEdit={openEdit}
          onCreateSubtask={openCreate}
          onToggleDone={toggleDone}
          onDelete={removeTask}
          onReorder={reorderTasks}
        />
      )}

      <LinkedNotes view={dayNotes} empty="hidden" />
    </div>
  );
};

const TasksView: FC = () => (
  <Suspense fallback={<p className="text-sm text-muted">Loading tasks…</p>}>
    <TasksViewContent />
  </Suspense>
);

export default TasksView;
