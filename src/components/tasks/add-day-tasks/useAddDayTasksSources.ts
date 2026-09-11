"use client";

import { useState } from "react";

export type AddDayTasksSource = "none" | "routines" | "backlog" | "sprint";

export function useAddDayTasksSources() {
  const [source, setSource] = useState<AddDayTasksSource>("none");
  const [createOpen, setCreateOpen] = useState(false);

  const openSource = (next: Exclude<AddDayTasksSource, "none">) =>
    setSource(next);
  const closeSource = () => setSource("none");
  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);

  const closeAll = () => {
    setSource("none");
    setCreateOpen(false);
  };

  return {
    source,
    createOpen,
    openSource,
    closeSource,
    openCreate,
    closeCreate,
    closeAll,
  };
}
