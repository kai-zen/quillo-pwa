"use client";

import { FC } from "react";
import { Modal } from "@/components/common";
import TaskForm from "@/components/tasks/form/TaskForm";
import { useLabelsApi, useProjectsApi, useSprintsApi } from "@/shared/hooks";
import type { RecordId } from "@/shared/types";

interface Props {
  open: boolean;
  doingDate: string;
  defaultSprintId?: RecordId | null;
  onClose: () => void;
  onSaved: () => void;
}

const CreateDayTaskModal: FC<Props> = ({
  open,
  doingDate,
  defaultSprintId = null,
  onClose,
  onSaved,
}) => {
  const { useLabelsList } = useLabelsApi();
  const { useSprintsList } = useSprintsApi();
  const { useProjectsList } = useProjectsApi();
  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const sprintsQuery = useSprintsList({ page: 1, limit: 100 });
  const projectsQuery = useProjectsList({ page: 1, limit: 250 });

  const labels = labelsQuery.data?.items ?? [];
  const sprints = sprintsQuery.data?.items ?? [];
  const projects = projectsQuery.data?.items ?? [];

  const handleSaved = () => {
    onSaved();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New task"
      className="max-w-3xl sm:max-h-[90vh]"
    >
      {open && (
        <TaskForm
          key={`create-${doingDate}-${defaultSprintId ?? "none"}`}
          mode={{
            type: "create",
            doingDate,
            sprintId: defaultSprintId,
          }}
          labels={labels}
          sprints={sprints}
          projects={projects}
          onClose={onClose}
          onSaved={handleSaved}
        />
      )}
    </Modal>
  );
};

export default CreateDayTaskModal;
