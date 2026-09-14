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
import { useTasksDayView } from "../useTasksDayView";
import TasksDayBody from "./TasksDayBody";
import TasksViewModals from "./TasksViewModals";
import DailyActionsBar from "./DailyActionsBar";

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
      <DailyActionsBar
        addHandler={() => {
          if (showNotes) linkedNotesRef.current?.openCreate();
          else openCreate();
        }}
        selectedDate={selectedDate}
        jumpToDate={jumpToDate}
        showNotes={showNotes}
        toggleNotes={toggleNotes}
      />
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
