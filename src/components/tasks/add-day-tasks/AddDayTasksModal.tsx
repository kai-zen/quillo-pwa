"use client";

import { FC, ReactNode, useMemo } from "react";
import { Button, Modal } from "@/components/common";
import { pickActiveSprint } from "@/components/sprints/helpers";
import { formatDayShort } from "@/components/tasks/helpers";
import { useSprintsApi } from "@/shared/hooks";
import type { Sprint } from "@/shared/types";
import AddDayTasksModals from "./AddDayTasksModals";
import AddDayTasksPanel from "./AddDayTasksPanel";
import { useAddDayTasksSources } from "./useAddDayTasksSources";

interface Props {
  open: boolean;
  doingDate: string;
  onClose: () => void;
  title?: string;
  description?: ReactNode;
  activeSprint?: Sprint | null;
}

const AddDayTasksModal: FC<Props> = ({
  open,
  doingDate,
  onClose,
  title,
  description,
  activeSprint: activeSprintProp,
}) => {
  const { useSprintsList } = useSprintsApi();
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const activeSprintFromQuery = useMemo(
    () => pickActiveSprint(sprintsQuery.data?.items ?? []),
    [sprintsQuery.data?.items],
  );
  const activeSprint = activeSprintProp ?? activeSprintFromQuery;
  const modals = useAddDayTasksSources();

  const handleClose = () => {
    modals.closeAll();
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={title ?? `Add tasks · ${formatDayShort(doingDate)}`}
        className="max-w-3xl sm:max-h-[90vh]"
      >
        {open && (
          <AddDayTasksPanel
            doingDate={doingDate}
            activeSprint={activeSprint}
            description={description}
            onCreateNewTask={modals.openCreate}
            onAddFromRoutines={() => modals.openSource("routines")}
            onAddFromBacklog={() => modals.openSource("backlog")}
            onAddFromSprint={() => modals.openSource("sprint")}
            footer={
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <Button variant="ghost" onClick={handleClose}>
                  Done
                </Button>
              </div>
            }
          />
        )}
      </Modal>

      <AddDayTasksModals
        doingDate={doingDate}
        source={modals.source}
        createOpen={modals.createOpen}
        activeSprint={activeSprint}
        onCloseSource={modals.closeSource}
        onCloseCreate={modals.closeCreate}
      />
    </>
  );
};

export default AddDayTasksModal;
