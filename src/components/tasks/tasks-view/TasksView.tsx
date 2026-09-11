"use client";

import { StickyNote, Plus } from "lucide-react";
import { FC, Suspense, useRef } from "react";
import {
  Button,
  DatePickerIconButton,
  IconButton,
  cn,
} from "@/components/common";
import { DailyReview } from "@/components/daily-reviews";
import useFinishDay from "@/components/daily-reviews/useFinishDay";
import type { LinkedNotesHandle } from "@/components/notes";
import { ActiveSprintCard } from "@/components/sprints";
import DayStrip from "../DayStrip";
import { formatDayShort } from "../helpers";
import { useTasksDayView } from "../useTasksDayView";
import TasksDayBody from "./TasksDayBody";
import TasksViewModals from "./TasksViewModals";

const TasksViewContent: FC = () => {
  const view = useTasksDayView();
  const {
    selectedDate,
    stripCenter,
    selectDate,
    jumpToDate,
    showNotes,
    toggleNotes,
    sprints,
    openCreate,
    openEdit,
  } = view;

  const linkedNotesRef = useRef<LinkedNotesHandle>(null);
  const finishDay = useFinishDay(selectedDate);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div>
        <DayStrip
          centerDate={stripCenter}
          selectedDate={selectedDate}
          onSelect={selectDate}
          canOpenReview={finishDay.reviewable}
          onOpenReview={finishDay.openFinishDay}
        />
      </div>
      <ActiveSprintCard
        sprints={sprints}
        selectedDate={selectedDate}
        onCreateTask={(sprintId) => openCreate(undefined, sprintId)}
        onEditTask={openEdit}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full flex items-center justify-between gap-2">
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
              <StickyNote
                className={cn(
                  "h-5 w-5 origin-top transition-transform duration-200 ease-out",
                  showNotes ? "" : "rotate-14 translate-y-px translate-x-[2px]",
                )}
                aria-hidden
              />
            </IconButton>
            <Button
              onClick={() => {
                if (showNotes) linkedNotesRef.current?.openCreate();
                else openCreate();
              }}
              size="sm"
              className="w-[100px]"
              variant={showNotes ? "secondary" : "primary"}
              startIcon={<Plus className="h-4 w-4" aria-hidden />}
            >
              {showNotes ? "Add note" : "Add task"}
            </Button>
          </div>
        </div>
      </div>
      <TasksDayBody view={view} linkedNotesRef={linkedNotesRef} />
      <TasksViewModals view={view} />
      <DailyReview
        key={`review-${selectedDate}`}
        date={selectedDate}
        view={finishDay}
      />
    </div>
  );
};

const TasksView: FC = () => (
  <Suspense fallback={<p className="text-sm text-muted">Loading tasks…</p>}>
    <TasksViewContent />
  </Suspense>
);

export default TasksView;
