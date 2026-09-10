"use client";

import { useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useProgressesApi, useSprintsApi } from "@/shared/hooks";
import type { Progress, RecordId, Sprint } from "@/shared/types";
import { toUpdateBody } from "../helpers";

const PAGE_LIMIT = 100;

const matchesSearch = (progress: Progress, query: string): boolean => {
  if (!query) return true;
  return progress.title.toLowerCase().includes(query);
};

export function useAddProgressToSprint(sprint: Sprint, onClose: () => void) {
  const { useProgressesList } = useProgressesApi();
  const { updateSprint, isUpdating } = useSprintsApi();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<RecordId>>(new Set());
  const [error, setError] = useState("");

  const progressesQuery = useProgressesList({ page: 1, limit: PAGE_LIMIT });
  const listTotal = progressesQuery.data?.total ?? 0;
  const available = useMemo(() => {
    const linked = new Set(sprint.progress_ids ?? []);
    return (progressesQuery.data?.items ?? []).filter(
      (progress) => !linked.has(progress._id),
    );
  }, [progressesQuery.data?.items, sprint.progress_ids]);

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () => available.filter((progress) => matchesSearch(progress, query)),
    [available, query],
  );

  const selectedCount = selectedIds.size;
  const visibleIds = useMemo(
    () => visible.map((progress) => progress._id),
    [visible],
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const isLoading = progressesQuery.isLoading;
  const isError = progressesQuery.isError;
  const isEmpty = !isLoading && !isError && available.length === 0;
  const isFilterEmpty =
    !isLoading && !isError && available.length > 0 && visible.length === 0;
  const isTruncated = listTotal > PAGE_LIMIT;

  const toggle = (id: RecordId) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  };

  const onSubmit = async () => {
    if (selectedCount === 0 || isUpdating) return;
    setError("");

    try {
      await updateSprint(sprint._id, {
        ...toUpdateBody(sprint),
        progress_ids: [
          ...new Set([...(sprint.progress_ids ?? []), ...selectedIds]),
        ],
      });
      onClose();
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not add progress to this sprint."),
      );
    }
  };

  return {
    search,
    setSearch,
    selectedIds,
    selectedCount,
    visible,
    allVisibleSelected,
    isLoading,
    isError,
    isEmpty,
    isFilterEmpty,
    isTruncated,
    pending: isUpdating,
    error,
    toggle,
    toggleAllVisible,
    onSubmit,
  };
}

export type AddProgressToSprintViewModel = ReturnType<
  typeof useAddProgressToSprint
>;
