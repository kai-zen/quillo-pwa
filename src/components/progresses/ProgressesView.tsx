"use client";

import { FC } from "react";
import ProgressesList from "./ProgressesList";
import { useProgressesListView } from "./hooks/useProgressesListView";

const ProgressesView: FC = () => {
  const view = useProgressesListView();
  return <ProgressesList view={view} />;
};

export default ProgressesView;
