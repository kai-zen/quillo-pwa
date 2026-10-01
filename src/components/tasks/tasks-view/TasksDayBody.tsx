"use client";

import { Plus } from "lucide-react";
import { FC, RefObject, useState } from "react";
import { Button, ConfirmModal } from "@/components/common";
import {
  DailySectionsToolbar,
  DayScheduleList,
  useDailySectionsActions,
} from "@/components/day-sections";
import { LinkedNotes, type LinkedNotesHandle } from "@/components/notes";
import DayProgress from "../DayProgress";
import { formatDayHeading } from "../helpers";
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
    openApplyTemplate,
  } = view;

  const [scheduleError, setScheduleError] = useState("");
  const sectionActions = useDailySectionsActions(selectedDate, tasks);
  const {
    hasSections,
    pending: sectionsPending,
    actionError: sectionActionError,
    toDelete: sectionToDelete,
    addSection,
    clearDelete: clearSectionDelete,
    confirmDelete: confirmSectionDelete,
  } = sectionActions;

  const heading = formatDayHeading(selectedDate);
  const showProgress = !isLoading && !isError && tasks.length > 0;
  const showSectionsUi = !showNotes && !isLoading && !isError;
  const hasScheduleItems = hasSections || tasks.length > 0;

  return (
    <>
      {showProgress ? <DayProgress tasks={tasks} /> : null}

      {showNotes ? (
        <LinkedNotes
          ref={linkedNotesRef}
          key={selectedDate}
          date={selectedDate}
          showAddButton={false}
        />
      ) : (
        <>
          {showSectionsUi && (
            <DailySectionsToolbar
              pending={sectionsPending}
              onAddSection={() => void addSection()}
              onApplyTemplate={openApplyTemplate}
            />
          )}

          {isLoading && <p className="text-sm text-muted">Loading tasks…</p>}

          {isError && (
            <p className="text-sm text-foreground">
              Could not load tasks. Try refreshing the page.
            </p>
          )}

          {isEmpty && !hasSections && (
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

          {(actionError || sectionActionError || scheduleError) && (
            <p className="text-sm text-foreground">
              {actionError || sectionActionError || scheduleError}
            </p>
          )}

          {!isLoading && !isError && hasScheduleItems && (
            <DayScheduleList
              date={selectedDate}
              sections={sectionActions}
              tasks={tasks}
              labels={labels}
              pendingId={pendingId}
              onEdit={openEdit}
              onCreateSubtask={openCreate}
              onToggleDone={toggleDone}
              onDelete={requestDelete}
              onReorderError={setScheduleError}
            />
          )}
        </>
      )}

      <ConfirmModal
        open={!!sectionToDelete}
        title="Delete section"
        description={
          sectionToDelete
            ? `Delete “${sectionToDelete.title.trim() || "Untitled"}”? Tasks for this day stay as they are.`
            : undefined
        }
        confirmLabel="Delete"
        pending={sectionsPending}
        pendingLabel="Deleting…"
        onClose={clearSectionDelete}
        onConfirm={() => void confirmSectionDelete()}
      />
    </>
  );
};

export default TasksDayBody;
