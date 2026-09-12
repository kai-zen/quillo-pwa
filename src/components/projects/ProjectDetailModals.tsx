"use client";

import { Modal } from "@/components/common";
import TaskForm, { taskFormTitle } from "@/components/tasks/form/TaskForm";
import AddTasksToProjectModal from "./AddTasksToProjectModal";
import ProjectForm, { projectFormTitle } from "./form/ProjectForm";
import type { ProjectDetailViewModel } from "./hooks/useProjectDetail";

export default function ProjectDetailModals({
  view,
}: {
  view: ProjectDetailViewModel;
}) {
  const {
    project,
    projectId,
    projects,
    sprints,
    labels,
    projectFormMode,
    taskFormMode,
    addTasksOpen,
    closeProjectForm,
    onProjectSaved,
    closeTaskForm,
    openCreateTask,
    closeAddTasks,
  } = view;
  if (!project) return null;

  return (
    <>
      <Modal
        open={!!projectFormMode}
        onClose={closeProjectForm}
        title={projectFormMode ? projectFormTitle(projectFormMode) : ""}
        className="max-w-3xl"
      >
        {projectFormMode && (
          <ProjectForm
            key={project._id}
            mode={projectFormMode}
            onClose={closeProjectForm}
            onSaved={onProjectSaved}
          />
        )}
      </Modal>
      <AddTasksToProjectModal
        open={addTasksOpen}
        projectId={projectId}
        projects={projects}
        onClose={closeAddTasks}
        onCreateTask={() => {
          closeAddTasks();
          openCreateTask();
        }}
      />
      <Modal
        open={!!taskFormMode}
        onClose={closeTaskForm}
        title={taskFormMode ? taskFormTitle(taskFormMode) : ""}
        className="max-w-3xl"
      >
        {taskFormMode && (
          <TaskForm
            key={
              taskFormMode.type === "edit"
                ? taskFormMode.task._id
                : `create-${taskFormMode.parentId ?? "root"}-${projectId}`
            }
            mode={taskFormMode}
            labels={labels}
            sprints={sprints}
            projects={projects}
            onClose={closeTaskForm}
            onSaved={closeTaskForm}
          />
        )}
      </Modal>
    </>
  );
}
