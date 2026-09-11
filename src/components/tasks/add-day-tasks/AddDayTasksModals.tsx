"use client";

import { FC } from "react";
import type { Sprint } from "@/shared/types";
import AddDayTasksSourceModals from "./AddDayTasksSourceModals";
import CreateDayTaskModal from "./CreateDayTaskModal";
import type { AddDayTasksSource } from "./useAddDayTasksSources";

interface Props {
  doingDate: string;
  source: AddDayTasksSource;
  createOpen: boolean;
  activeSprint: Sprint | null;
  onCloseSource: () => void;
  onCloseCreate: () => void;
}

const AddDayTasksModals: FC<Props> = ({
  doingDate,
  source,
  createOpen,
  activeSprint,
  onCloseSource,
  onCloseCreate,
}) => (
  <>
    <CreateDayTaskModal
      open={createOpen}
      doingDate={doingDate}
      defaultSprintId={activeSprint?._id ?? null}
      onClose={onCloseCreate}
      onSaved={onCloseCreate}
    />

    <AddDayTasksSourceModals
      doingDate={doingDate}
      source={source}
      activeSprint={activeSprint}
      onClose={onCloseSource}
    />
  </>
);

export default AddDayTasksModals;
