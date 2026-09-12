"use client";

import { FolderKanban, ListFilter, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Button,
  Modal,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  cn,
} from "@/components/common";
import type { ProjectStatus } from "@/shared/types";
import ProjectForm, { projectFormTitle } from "./form/ProjectForm";
import {
  PROJECT_STATUS_BADGE_CLASS,
  PROJECT_STATUS_DOT_CLASS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_OPTIONS,
  projectHref,
} from "./helpers";
import type { ProjectsListViewModel } from "./hooks/useProjectsListView";

export default function ProjectsList({ view }: { view: ProjectsListViewModel }) {
  const router = useRouter();
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-32">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project._id}
                onClick={() => router.push(projectHref(project))}
                aria-label={`Open project ${project.name}`}
              >
                <TableCell>
                  <span className="flex items-center gap-2 font-medium">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: project.color }} aria-hidden />
                    <span className="truncate">{project.name}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <span className="block max-w-xl truncate text-sm text-muted">
                    {project.description || "No description"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold",
                    PROJECT_STATUS_BADGE_CLASS[project.status],
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", PROJECT_STATUS_DOT_CLASS[project.status])} aria-hidden />
                    {PROJECT_STATUS_LABELS[project.status]}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
