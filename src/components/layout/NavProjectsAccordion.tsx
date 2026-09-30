"use client";

import Link from "next/link";
import { ChevronDown, FolderKanban } from "lucide-react";
import { FC, useState } from "react";
import { projectHref } from "@/components/projects/helpers";
import { useProjectsApi } from "@/shared/hooks";

interface Props {
  pathname: string;
  onNavigate?: () => void;
  itemClassName?: string;
}

const isProjectsSection = (pathname: string) =>
  pathname === "/projects" || pathname.startsWith("/projects/");

const NavProjectsAccordion: FC<Props> = ({
  pathname,
  onNavigate,
  itemClassName = "py-2",
}) => {
  const { useProjectsList } = useProjectsApi();
  const projectsQuery = useProjectsList({ page: 1, limit: 50 });
  const projects = projectsQuery.data?.items ?? [];

  const sectionActive = isProjectsSection(pathname);
  const [expanded, setExpanded] = useState(true);

  const subLinkClass = (active: boolean) =>
    [
      "flex items-center gap-2 rounded-md py-1.5 pl-9 pr-3 text-sm transition-colors",
      active
        ? "bg-accent-soft font-medium text-nav-active"
        : "text-muted hover:bg-background hover:text-foreground",
    ].join(" ");

  return (
    <details
      className="group/projects"
      open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
    >
      <summary
        className={[
          "flex cursor-pointer list-none items-center gap-2.5 rounded-md px-3 text-sm transition-colors",
          "[&::-webkit-details-marker]:hidden",
          itemClassName,
          sectionActive
            ? "bg-accent-soft font-medium text-nav-active"
            : "text-muted hover:bg-background hover:text-foreground",
        ].join(" ")}
      >
        <FolderKanban
          className="h-4 w-4 shrink-0"
          strokeWidth={sectionActive ? 2.25 : 2}
          aria-hidden
        />
        <span className="min-w-0 flex-1">Projects</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted transition-transform group-open/projects:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="mt-0.5 flex flex-col gap-0.5">
        <Link
          href="/projects"
          className={subLinkClass(pathname === "/projects")}
          aria-current={pathname === "/projects" ? "page" : undefined}
          onClick={onNavigate}
        >
          See all
        </Link>

        {projectsQuery.isLoading && (
          <span className="px-9 py-1.5 text-sm text-muted">Loading…</span>
        )}

        {!projectsQuery.isLoading &&
          projects.map((project) => {
            const href = projectHref(project);
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={project._id}
                href={href}
                className={subLinkClass(active)}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                  aria-hidden
                />
                <span className="min-w-0 truncate">{project.name}</span>
              </Link>
            );
          })}
      </div>
    </details>
  );
};

export default NavProjectsAccordion;
