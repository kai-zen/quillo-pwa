"use client";

import { useState } from "react";
import { useSectionTemplatesApi } from "@/shared/hooks";
import type { SectionTemplate, SectionTemplateListQuery } from "@/shared/types";
import type { SectionTemplateFormMode } from "../form/SectionTemplateForm";

const PAGE_LIMIT = 50;

export function useSectionTemplatesListView() {
  const { useSectionTemplatesList } = useSectionTemplatesApi();

  const [page, setPage] = useState(1);
  const [templateFormMode, setTemplateFormMode] =
    useState<SectionTemplateFormMode | null>(null);

  const listQuery: SectionTemplateListQuery = {
    page,
    limit: PAGE_LIMIT,
  };

  const templatesQuery = useSectionTemplatesList(listQuery);

  const templates: SectionTemplate[] = templatesQuery.data?.items ?? [];
  const total = templatesQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const isLoading = templatesQuery.isLoading;
  const isError = templatesQuery.isError;
  const isEmpty = !isLoading && !isError && templates.length === 0;
  const isFetching = templatesQuery.isFetching;

  const openCreateTemplate = () => setTemplateFormMode({ type: "create" });
  const openEditTemplate = (template: SectionTemplate) =>
    setTemplateFormMode({ type: "edit", template });
  const closeTemplateForm = () => setTemplateFormMode(null);
  const onTemplateSaved = () => setTemplateFormMode(null);

  return {
    page,
    setPage,
    templateFormMode,
    templates,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateTemplate,
    openEditTemplate,
    closeTemplateForm,
    onTemplateSaved,
  };
}

export type SectionTemplatesListViewModel = ReturnType<
  typeof useSectionTemplatesListView
>;
