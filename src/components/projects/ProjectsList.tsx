"use client";

import { FolderKanban, ListFilter, Plus } from "lucide-react";
import { Button, Modal, PageHeader, Select } from "@/components/common";
import type { ProjectStatus } from "@/shared/types";
import ProjectCard from "./ProjectCard";
import ProjectForm, { projectFormTitle } from "./form/ProjectForm";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_OPTIONS } from "./helpers";
import type { ProjectsListViewModel } from "./hooks/useProjectsListView";

export default function ProjectsList({ view }: { view: ProjectsListViewModel }) {
  const {
    statusFilter, setStatusFilterAndResetPage, page, setPage, projectFormMode,
    projects, total, totalPages, isLoading, isError, isFetching, isEmpty,
    openCreateProject, closeProjectForm, onProjectSaved,
  } = view;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title="Projects"
        description="Group related tasks outside sprint planning."
        icon={FolderKanban}
        actions={
          <Button size="sm" onClick={openCreateProject}>
            <Plus className="h-4 w-4" aria-hidden /> New project
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
        <span className="inline-flex items-center gap-2 pl-1 text-sm font-medium">
          <ListFilter className="h-4 w-4 text-muted" aria-hidden /> Filter
        </span>
        <span className="h-5 w-px bg-border" aria-hidden />
        <label className="sr-only" htmlFor="projects-status-filter">Filter by status</label>
        <Select
          id="projects-status-filter"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilterAndResetPage(event.target.value as ProjectStatus | "")
          }
          sizeVariant="sm"
        >
          <option value="">All statuses</option>
          {PROJECT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{PROJECT_STATUS_LABELS[status]}</option>
          ))}
        </Select>
        <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
          {total} project{total === 1 ? "" : "s"}
        </span>
      </div>
      <Modal
        open={!!projectFormMode}
        onClose={closeProjectForm}
        title={projectFormMode ? projectFormTitle(projectFormMode) : ""}
        className="max-w-3xl"
      >
        {projectFormMode && (
          <ProjectForm
            key="create-project"
            mode={projectFormMode}
            onClose={closeProjectForm}
            onSaved={onProjectSaved}
          />
        )}
      </Modal>
      {isLoading && <p className="text-sm text-muted">Loading projects…</p>}
      {isError && <p className="text-sm">Could not load projects. Try refreshing the page.</p>}
      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium">{statusFilter ? "No matching projects" : "No projects yet"}</p>
          <p className="mt-1 text-sm text-muted">
            {statusFilter ? "Try another status." : "Create a project to keep related tasks together."}
          </p>
          {!statusFilter && (
            <Button className="mt-4" variant="secondary" onClick={openCreateProject}>
              New project
            </Button>
          )}
        </div>
      )}
      {!isLoading && !isError && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1 || isFetching}>
            Previous
          </Button>
          <span className="text-sm text-muted">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages || isFetching}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
