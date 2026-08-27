"use client";

import { useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useRoutinesApi } from "@/shared/hooks";
import type { RecordId, Routine } from "@/shared/types";
import { dayOfWeekFromIso } from "../helpers";

const PAGE_LIMIT = 100;

export function useApplyRoutines(doingDate: string, onClose: () => void) {
  const { useRoutinesList, applyRoutines, isApplying } = useRoutinesApi();
  const [search, setSearch] = useState("");
  const [onlyThisDay, setOnlyThisDay] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<RecordId>>(new Set());
  const [error, setError] = useState("");

  const day = dayOfWeekFromIso(doingDate);
  const listQuery = {
    page: 1,
    limit: PAGE_LIMIT,
    ...(onlyThisDay ? { day } : {}),
  };

  const routinesQuery = useRoutinesList(listQuery);
  const listTotal = routinesQuery.data?.total ?? 0;

  const available = useMemo(
    () => (routinesQuery.data?.items ?? []) as Routine[],
    [routinesQuery.data?.items],
  );

  const query = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      available.filter((routine) => {
        if (!query) return true;
        if (routine.name.toLowerCase().includes(query)) return true;
        return routine.drafts.some((draft) =>
          draft.title.toLowerCase().includes(query),
        );
      }),
    [available, query],
  );

  const selectedCount = selectedIds.size;
  const visibleIds = useMemo(
    () => visible.map((routine) => routine._id),
    [visible],
  );
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));

  const selectedDraftCount = useMemo(() => {
    const selected = new Set(selectedIds);
    return available.reduce((total, routine) => {
      if (!selected.has(routine._id)) return total;
      return total + routine.drafts.length;
    }, 0);
  }, [available, selectedIds]);

  const isLoading = routinesQuery.isLoading;
  const isError = routinesQuery.isError;
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
    if (selectedCount === 0 || isApplying) return;
    setError("");

    try {
      await applyRoutines({
        routine_ids: [...selectedIds],
        doing_date: doingDate,
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not add routines to this day."));
    }
  };

  return {
    search,
    setSearch,
    onlyThisDay,
    setOnlyThisDay,
    selectedIds,
    selectedCount,
    selectedDraftCount,
    visible,
    allVisibleSelected,
    isLoading,
    isError,
    isEmpty,
    isFilterEmpty,
    isTruncated,
    pending: isApplying,
    error,
    toggle,
    toggleAllVisible,
    onSubmit,
  };
}

export type ApplyRoutinesViewModel = ReturnType<typeof useApplyRoutines>;
