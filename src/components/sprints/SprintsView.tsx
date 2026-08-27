"use client";

import { FC } from "react";
import SprintsList from "./SprintsList";
import { useSprintsListView } from "./hooks/useSprintsListView";

const SprintsView: FC = () => {
  const view = useSprintsListView();
  return <SprintsList view={view} />;
};

export default SprintsView;
