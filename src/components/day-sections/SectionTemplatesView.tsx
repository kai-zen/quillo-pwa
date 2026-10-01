"use client";

import { FC } from "react";
import SectionTemplatesList from "./SectionTemplatesList";
import { useSectionTemplatesListView } from "./hooks/useSectionTemplatesListView";

const SectionTemplatesView: FC = () => {
  const view = useSectionTemplatesListView();
  return <SectionTemplatesList view={view} />;
};

export default SectionTemplatesView;
