"use client";

import { useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useSectionTemplatesApi } from "@/shared/hooks";
import type { RecordId, SectionTemplate } from "@/shared/types";
import { formatSectionCount, sectionsFromTemplate } from "../helpers";

const PAGE_LIMIT = 100;

export function useApplySectionTemplate(date: string, onClose: () => void) {
  const { useSectionTemplatesList, applySectionTemplate, isApplying } =
    useSectionTemplatesApi();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<RecordId | null>(null);
  const [error, setError] = useState("");

  const templatesQuery = useSectionTemplatesList({ page: 1, limit: PAGE_LIMIT });
  const listTotal = templatesQuery.data?.total ?? 0;

  const available = useMemo(
    () => (templatesQuery.data?.items ?? []) as SectionTemplate[],
    [templatesQuery.data?.items],
  );

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      available.filter((template) => {
        if (!query) return true;
        if (template.name.toLowerCase().includes(query)) return true;
        return template.sections.some((section) =>
          section.title.toLowerCase().includes(query),
        );
      }),
    [available, query],
  );

  const selectedTemplate = useMemo(
    () => available.find((template) => template._id === selectedId) ?? null,
    [available, selectedId],
  );

  const selectedSectionCount = selectedTemplate?.sections.length ?? 0;
  const isLoading = templatesQuery.isLoading;
  const isError = templatesQuery.isError;
  const isEmpty = !isLoading && !isError && available.length === 0;
  const isFilterEmpty =
    !isLoading && !isError && available.length > 0 && visible.length === 0;
  const isTruncated = listTotal > PAGE_LIMIT;

  const onSubmit = async () => {
    if (!selectedId || isApplying) return;
    setError("");

    try {
      await applySectionTemplate(selectedId, { date });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not apply template to this day."));
    }
  };

  return {
    search,
    setSearch,
    selectedId,
    setSelectedId,
    selectedTemplate,
    selectedSectionCount,
    visible,
    isLoading,
    isError,
    isEmpty,
    isFilterEmpty,
    isTruncated,
    pending: isApplying,
    error,
    onSubmit,
    previewSections: selectedTemplate
      ? sectionsFromTemplate(selectedTemplate.sections)
      : [],
    formatSectionCount,
  };
}

export type ApplySectionTemplateViewModel = ReturnType<
  typeof useApplySectionTemplate
>;
