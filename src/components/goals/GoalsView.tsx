"use client";

import { FC } from "react";
import GoalsList from "./GoalsList";
import { useGoalsListView } from "./hooks/useGoalsListView";

const GoalsView: FC = () => {
  const view = useGoalsListView();
  return <GoalsList view={view} />;
};

export default GoalsView;
