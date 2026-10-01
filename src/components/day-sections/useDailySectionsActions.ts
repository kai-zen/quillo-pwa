"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { queryKeys, useDailySectionsApi } from "@/shared/hooks";
import type { DailySection, RecordId } from "@/shared/types";
import { sectionsFromDaily } from "./helpers";

export function useDailySectionsActions(date: string) {
  const queryClient = useQueryClient();
  const {
    useDailySectionsByDate,
    createDailySection,
    updateDailySection,
    reorderDailySections,
    deleteDailySection,
    isCreating,
    isUpdating,
    isReordering,
    isDeleting,
  } = useDailySectionsApi();

  const reorderGen = useRef(0);
  const [actionError, setActionError] = useState("");
  const [editingId, setEditingId] = useState<RecordId | null>(null);
  const [toDelete, setToDelete] = useState<DailySection | null>(null);

  const sectionsQuery = useDailySectionsByDate(date);
  const sections = sectionsFromDaily(sectionsQuery.data?.items ?? []);

  const pending = isCreating || isUpdating || isReordering || isDeleting;

  const addSection = async () => {
    setActionError("");
    try {
      const created = await createDailySection({
        date,
        title: "",
        sort_order: sections.length,
      });
      setEditingId(created._id);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not add section."));
    }
  };

  const saveSectionTitle = async (section: DailySection, title: string) => {
    const nextTitle = title.trim();
    if (nextTitle === section.title.trim()) {
      setEditingId(null);
      return;
    }

    setActionError("");
    try {
      await updateDailySection(section._id, {
        title: nextTitle,
        sort_order: section.sort_order,
      });
      setEditingId(null);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not update section."));
    }
  };

  const reorderSections = useCallback(
    async (orderedIds: RecordId[]) => {
      if (orderedIds.length < 2) return;

      const key = queryKeys.dailySections.byDate(date);
      const gen = ++reorderGen.current;

      queryClient.setQueryData(
        key,
        (current: { items: DailySection[] } | undefined) => {
          if (!current) return current;
          const orderById = new Map(
            orderedIds.map((id, sort_order) => [id, sort_order]),
          );
          return {
            ...current,
            items: current.items.map((section) => {
              const sort_order = orderById.get(section._id);
              return sort_order === undefined
                ? section
                : { ...section, sort_order };
            }),
          };
        },
      );

      setActionError("");
      try {
        await reorderDailySections({
          items: orderedIds.map((id, sort_order) => ({ id, sort_order })),
        });
      } catch (err) {
        if (gen !== reorderGen.current) return;
        await queryClient.invalidateQueries({
          queryKey: queryKeys.dailySections.all,
        });
        setActionError(getErrorMessage(err, "Could not save section order."));
      }
    },
    [date, queryClient, reorderDailySections],
  );

  const requestDelete = (section: DailySection) => setToDelete(section);
  const clearDelete = () => setToDelete(null);

  const confirmDelete = async () => {
    if (!toDelete || isDeleting) return;
    const section = toDelete;
    setToDelete(null);
    setActionError("");

    try {
      await deleteDailySection(section._id);
      if (editingId === section._id) setEditingId(null);
    } catch (err) {
      setActionError(getErrorMessage(err, "Could not delete section."));
    }
  };

  return {
    sections,
    isLoading: sectionsQuery.isLoading,
    isError: sectionsQuery.isError,
    hasSections: sections.length > 0,
    pending,
    actionError,
    editingId,
    setEditingId,
    toDelete,
    addSection,
    saveSectionTitle,
    reorderSections,
    requestDelete,
    clearDelete,
    confirmDelete,
  };
}

export type DailySectionsActions = ReturnType<typeof useDailySectionsActions>;
