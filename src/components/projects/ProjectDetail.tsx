"use client";

import { ListPlus, Pencil } from "lucide-react";
import {
  Button,
  IconButton,
  Markdown,
  PageHeader,
  cn,
} from "@/components/common";
import { LinkedNotes } from "@/components/notes";
import type { RecordId } from "@/shared/types";
import {
  PROJECT_STATUS_BADGE_CLASS,
  PROJECT_STATUS_DOT_CLASS,
  PROJECT_STATUS_LABELS,
} from "./helpers";
import { useProjectDetail } from "./hooks/useProjectDetail";
import ProjectDetailModals from "./ProjectDetailModals";
import ProjectTasks from "./ProjectTasks";

export default function ProjectDetail({ projectId }: { projectId: RecordId }) {
  const view = useProjectDetail(projectId);
  const {
    project,
    isProjectLoading,
    isProjectError,
    isProjectMissing,
    openEditProject,
    openAddTasks,
  } = view;
  if (isProjectLoading)
    return (
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm text-muted">Loading project…</p>
      </div>
    );
  if (isProjectError || isProjectMissing || !project)
    return (
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          title={
            isProjectError ? "Could not load project" : "Project not found"
          }
          description={
            isProjectError
              ? "Try refreshing the page."
              : "This project may have been deleted."
          }
          back={{ href: "/projects", label: "All projects" }}
        />
      </div>
    );

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-5">
      <PageHeader
        title={project.name}
        back={{ href: "/projects", label: "All projects" }}
        eyebrow={
          <>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: project.color }}
                aria-hidden
              />
              Project
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                PROJECT_STATUS_BADGE_CLASS[project.status],
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  PROJECT_STATUS_DOT_CLASS[project.status],
                )}
                aria-hidden
              />
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
          </>
        }
        actions={
          <>
            <IconButton label="Edit project" onClick={openEditProject}>
              <Pencil className="h-4 w-4" aria-hidden />
            </IconButton>
            <Button size="sm" onClick={openAddTasks}>
              <ListPlus className="h-4 w-4" aria-hidden />
              Add tasks
            </Button>
          </>
        }
      >
        {project.description ? (
          <Markdown compact>{project.description}</Markdown>
        ) : null}
      </PageHeader>
      <ProjectTasks view={view} />

      <LinkedNotes of={project.name} projectId={projectId} />

      <ProjectDetailModals view={view} />
    </div>
  );
}
