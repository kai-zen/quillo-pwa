"use client";

import { FC } from "react";
import { ApplyRoutinesModal } from "@/components/routines";
import { ScheduleExistingTasksModal } from "@/components/tasks/schedule-existing";
import type { Sprint } from "@/shared/types";
import type { AddDayTasksSource } from "./useAddDayTasksSources";

interface Props {
  doingDate: string;
  source: AddDayTasksSource;
  activeSprint: Sprint | null;
  onClose: () => void;
}

const AddDayTasksSourceModals: FC<Props> = ({
  doingDate,
  source,
  activeSprint,
  onClose,
}) => (
  <>
    <ApplyRoutinesModal
      open={source === "routines"}
      doingDate={doingDate}
      onClose={onClose}
    />

    <ScheduleExistingTasksModal
      open={source === "backlog"}
      doingDate={doingDate}
      source="backlog"
      onClose={onClose}
    />

    <ScheduleExistingTasksModal
      open={source === "sprint"}
      doingDate={doingDate}
      source="sprint"
      sprintId={activeSprint?._id ?? null}
      sprintName={activeSprint?.name ?? null}
      onClose={onClose}
    />
  </>
);

export default AddDayTasksSourceModals;
