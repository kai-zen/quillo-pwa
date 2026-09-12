"use client";

import ProjectsList from "./ProjectsList";
import { useProjectsListView } from "./hooks/useProjectsListView";

export default function ProjectsView() {
  return <ProjectsList view={useProjectsListView()} />;
}
