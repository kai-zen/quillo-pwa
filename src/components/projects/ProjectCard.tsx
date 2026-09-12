import Link from "next/link";
import { FC } from "react";
import { cn } from "@/components/common";
import type { Project } from "@/shared/types";
import {
  PROJECT_STATUS_BADGE_CLASS,
  PROJECT_STATUS_DOT_CLASS,
  PROJECT_STATUS_LABELS,
  projectHref,
} from "./helpers";

interface Props {
  project: Project;
}

const ProjectCard: FC<Props> = ({ project }) => (
  <Link
    href={projectHref(project)}
    aria-label={`Open project ${project.name}`}
    className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm shadow-black/2 transition-colors hover:border-accent/50 hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
  >
    <span
      className="h-1 w-full shrink-0"
      style={{ backgroundColor: project.color }}
      aria-hidden
    />
    <div className="flex min-w-0 flex-col gap-1.5 p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 truncate font-medium text-foreground">
          {project.name}
        </span>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold",
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
      </div>
      <span className="line-clamp-2 text-sm leading-5 text-muted">
        {project.description || "No description"}
      </span>
    </div>
  </Link>
);

export default ProjectCard;
