"use client";

import { Plus } from "lucide-react";
import { FC, RefObject } from "react";
import { Button } from "@/components/common";
import { LinkedNotes, type LinkedNotesHandle } from "@/components/notes";
import DayProgress from "../DayProgress";
import { formatDayHeading } from "../helpers";
import TaskDayCards from "../TaskDayCards";
import type { TasksDayViewModel } from "../useTasksDayView";

interface Props {
  view: TasksDayViewModel;
  linkedNotesRef: RefObject<LinkedNotesHandle | null>;
}

const TasksDayBody: FC<Props> = ({ view, linkedNotesRef }) => {
  const {
    selectedDate,
    showNotes,
    labels,
    tasks,
    isLoading,
    isError,
    isEmpty,
    pendingId,
    actionError,
    openCreate,
    openEdit,
    toggleDone,
    requestDelete,
    reorderTasks,
  } = view;

  const heading = formatDayHeading(selectedDate);

  return (
    <>
      {!isLoading && !isError && tasks.length > 0 && (
        <DayProgress tasks={tasks} />
      )}

      {showNotes ? (
        <LinkedNotes
          ref={linkedNotesRef}
          key={selectedDate}
          date={selectedDate}
          showAddButton={false}
        />
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
              onDelete={requestDelete}
              onReorder={reorderTasks}
            />
          )}
        </>
      )}
    </>
  );
};

export default TasksDayBody;
