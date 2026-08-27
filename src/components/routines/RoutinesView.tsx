"use client";

import { FC } from "react";
import RoutinesList from "./RoutinesList";
import { useRoutinesListView } from "./hooks/useRoutinesListView";

const RoutinesView: FC = () => {
  const view = useRoutinesListView();
  return <RoutinesList view={view} />;
};

export default RoutinesView;
