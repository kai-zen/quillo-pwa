"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useId } from "react";
import { Button, Input, Modal, Tabs } from "@/components/common";
import { DAY_LABELS, dayOfWeekFromIso, formatRoutineDate } from "../helpers";
import { useApplyRoutines } from "../hooks/useApplyRoutines";
import RoutineOption from "./RoutineOption";

interface Props {
  open: boolean;
  doingDate: string;
  onClose: () => void;
}

const ApplyRoutinesModal: FC<Props> = ({ open, doingDate, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Add from routines"
    className="max-w-2xl"
  >
    {open && <ApplyRoutinesBody doingDate={doingDate} onClose={onClose} />}
  </Modal>
);

const ApplyRoutinesBody: FC<Omit<Props, "open">> = ({ doingDate, onClose }) => {
  const searchId = useId();
  const router = useRouter();
  const view = useApplyRoutines(doingDate, onClose);
  const {
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
    pending,
    error,
    toggle,
    toggleAllVisible,
    onSubmit,
  } = view;

  const dateLabel = formatRoutineDate(doingDate);
  const weekdayLabel = DAY_LABELS[dayOfWeekFromIso(doingDate)];

  const goManage = () => {
    onClose();
    router.push("/routines");
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Pick routines to create tasks for {dateLabel}.
      </p>

      <Tabs
        value={onlyThisDay ? "day" : "all"}
        onChange={(next) => setOnlyThisDay(next === "day")}
        disabled={pending}
        aria-label="Which routines to show"
        options={[
          { value: "day", label: weekdayLabel },
          { value: "all", label: "All routines" },
        ]}
      />

      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Search routines
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          id={searchId}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or draft"
          className="pl-9"
          autoFocus
        />
      </div>

      {visible.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="cursor-pointer text-xs font-medium text-muted transition-colors hover:text-foreground"
            onClick={toggleAllVisible}
          >
            {allVisibleSelected ? "Clear visible" : "Select visible"}
          </button>
          <span className="text-xs font-medium tabular-nums text-muted">
            {selectedCount} selected
          </span>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted">Loading routines…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load routines. Try closing and opening this again.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
          <p className="font-medium text-foreground">
            {onlyThisDay
              ? `No routines for ${weekdayLabel}`
              : "No routines yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {onlyThisDay
              ? `Choose All routines, or create one that includes ${weekdayLabel}.`
              : "Create a routine first, then add it here."}
          </p>
          <Button variant="secondary" className="mt-4" onClick={goManage}>
            Manage routines
          </Button>
        </div>
      )}

      {isFilterEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
          <p className="font-medium text-foreground">No matching routines</p>
          <p className="mt-1 text-sm text-muted">
            Try a different name or draft title.
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-label="Routines to add"
          className="max-h-[50vh] overflow-y-auto rounded-xl border border-border"
        >
          {visible.map((routine) => (
            <RoutineOption
              key={routine._id}
              routine={routine}
              selected={selectedIds.has(routine._id)}
              disabled={pending}
              onToggle={() => toggle(routine._id)}
            />
          ))}
        </ul>
      )}

      {isTruncated && (
        <p className="text-xs text-muted">Showing the first 100 routines.</p>
      )}

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {!isEmpty && (
          <Button
            variant="ghost"
            className="mr-auto"
            onClick={goManage}
            disabled={pending}
          >
            Manage routines
          </Button>
        )}
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={pending || selectedCount === 0}>
          {pending
            ? "Adding…"
            : selectedDraftCount === 0
              ? "Add tasks"
              : selectedDraftCount === 1
                ? "Add 1 task"
                : `Add ${selectedDraftCount} tasks`}
        </Button>
      </div>
    </div>
  );
};

export default ApplyRoutinesModal;
