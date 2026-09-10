"use client";

import { Plus, StickyNote } from "lucide-react";
import { FC, Suspense, useState } from "react";
import {
  Button,
  ConfirmModal,
  DatePickerIconButton,
  IconButton,
  Modal,
} from "@/components/common";
import { DailyReview } from "@/components/daily-reviews";
import { LinkedNotes } from "@/components/notes";
import { ApplyRoutinesModal } from "@/components/routines";
import { ActiveSprintCard } from "@/components/sprints";
import type { Task } from "@/shared/types";
import DayProgress from "./DayProgress";
import DayStrip from "./DayStrip";
import TaskForm, { taskFormTitle } from "./form/TaskForm";
import { formatDayHeading, formatDayShort } from "./helpers";
import TaskDayCards from "./TaskDayCards";
import { useTasksDayView } from "./useTasksDayView";

const TasksViewContent: FC = () => {
  const {
    selectedDate,
    stripCenter,
    selectDate,
    jumpToDate,
    showNotes,
    toggleNotes,
    formMode,
    labels,
    sprints,
    tasks,
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
  const [toDelete, setToDelete] = useState<Task | null>(null);

  const heading = formatDayHeading(selectedDate);

  const confirmDelete = () => {
    if (!toDelete || pendingId) return;
    const task = toDelete;
    setToDelete(null);
    void removeTask(task);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div>
        <DayStrip
          centerDate={stripCenter}
          selectedDate={selectedDate}
          onSelect={selectDate}
        />
      </div>

      <ActiveSprintCard
        sprints={sprints}
        selectedDate={selectedDate}
        onCreateTask={(sprintId) => openCreate(undefined, sprintId)}
        onEditTask={openEdit}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <DatePickerIconButton
              value={selectedDate}
              onChange={jumpToDate}
              label="Pick a date"
            />
            <p className="text-sm font-medium tabular-nums">
              {formatDayShort(selectedDate)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <IconButton
              label="Day notes"
              active={showNotes}
              aria-pressed={showNotes}
              onClick={toggleNotes}
            >
              <StickyNote className="h-5 w-5" aria-hidden />
            </IconButton>
            <Button
              onClick={() => openCreate()}
              size="sm"
              startIcon={<Plus className="h-4 w-4" aria-hidden />}
            >
              Add tasks
            </Button>
          </div>
        </div>
      </div>

      {!isLoading && !isError && tasks.length > 0 && (
        <DayProgress tasks={tasks} />
      )}

      {showNotes ? (
        <LinkedNotes key={selectedDate} date={selectedDate} />
      ) : (
        <>
          {isLoading && <p className="text-sm text-muted">Loading tasks…</p>}

          {isError && (
            <p className="text-sm text-foreground">
              Could not load tasks. Try refreshing the page.
            </p>
          )}

          {isEmpty && (
            <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
              <p className="font-medium text-foreground">
                No tasks for this day
              </p>
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
              </div>
            </div>
          )}

          {actionError && (
            <p className="text-sm text-foreground">{actionError}</p>
          )}

          {!isLoading && !isError && tasks.length > 0 && (
            <TaskDayCards
              tasks={tasks}
              labels={labels}
              pendingId={pendingId}
              onEdit={openEdit}
              onCreateSubtask={openCreate}
              onToggleDone={toggleDone}
              onDelete={setToDelete}
              onReorder={reorderTasks}
            />
          )}
        </>
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

      <ConfirmModal
        open={!!toDelete}
        title="Delete task"
        description={toDelete ? `Delete “${toDelete.title}”?` : undefined}
        confirmLabel="Delete"
        pending={!!pendingId}
        pendingLabel="Deleting…"
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />

      <DailyReview key={`review-${selectedDate}`} date={selectedDate} />
    </div>
  );
};

const TasksView: FC = () => (
  <Suspense fallback={<p className="text-sm text-muted">Loading tasks…</p>}>
    <TasksViewContent />
  </Suspense>
);

export default TasksView;
