"use client";

import { Plus } from "lucide-react";
import { FC } from "react";
import { Button, DatePicker, Modal } from "@/components/common";
import DayStrip from "./DayStrip";
import TaskForm, { taskFormTitle } from "./form/TaskForm";
import { formatDayHeading } from "./helpers";
import TaskSummaryTable from "./TaskSummaryTable";
import { useTasksDayView } from "./useTasksDayView";

const TasksView: FC = () => {
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
    openCreate,
    openEdit,
    closeForm,
  } = useTasksDayView();

  const heading = formatDayHeading(selectedDate);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
            Tasks
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Pick a day and work through what you planned to do.
          </p>
        </div>
        <Button onClick={() => openCreate()} className="shadow-sm">
          <Plus className="h-4 w-4" aria-hidden />
          New task
        </Button>
      </div>

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
          />
        )}
      </Modal>

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
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => openCreate()}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New task
          </Button>
        </div>
      )}

      {!isLoading && !isError && tasks.length > 0 && (
        <TaskSummaryTable tasks={tasks} labels={labels} onEdit={openEdit} />
      )}
    </div>
  );
};

export default TasksView;
