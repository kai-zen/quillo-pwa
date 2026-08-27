"use client";

import { Check, Repeat, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useId } from "react";
import { Button, Input, Modal, Select, cn } from "@/components/common";
import type { Routine } from "@/shared/types";
import { formatRoutineDate, formatSchedule } from "./helpers";
import { useApplyRoutines } from "./hooks/useApplyRoutines";

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
    {open && (
      <ApplyRoutinesBody doingDate={doingDate} onClose={onClose} />
    )}
  </Modal>
);

const ApplyRoutinesBody: FC<Omit<Props, "open">> = ({
  doingDate,
  onClose,
}) => {
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

  const goManage = () => {
    onClose();
    router.push("/routines");
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Pick routines to create tasks for {dateLabel}.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
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
        <Select
          value={onlyThisDay ? "day" : "all"}
          onChange={(event) => setOnlyThisDay(event.target.value === "day")}
          sizeVariant="sm"
          className="w-36"
          aria-label="Filter routines"
        >
          <option value="day">This day</option>
          <option value="all">All routines</option>
        </Select>
        <Button
          variant="secondary"
          onClick={goManage}
          disabled={pending}
          startIcon={<Repeat className="h-4 w-4" aria-hidden />}
        >
          Manage
        </Button>
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
            {onlyThisDay ? "No routines for this day" : "No routines yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {onlyThisDay
              ? "Switch to all routines, or create a routine that includes this weekday."
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
        <p className="text-xs text-muted">
          Showing the first 100 routines.
        </p>
      )}

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={pending || selectedCount === 0}
        >
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

interface RoutineOptionProps {
  routine: Routine;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

const RoutineOption: FC<RoutineOptionProps> = ({
  routine,
  selected,
  disabled,
  onToggle,
}) => {
  const draftPreview = routine.drafts
    .map((draft) => draft.title)
    .filter(Boolean)
    .slice(0, 4)
    .join(" · ");
  const extra = Math.max(0, routine.drafts.length - 4);

  return (
    <li
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex cursor-pointer items-start gap-3 border-b border-border px-3 py-2.5 last:border-b-0 transition-colors",
        "hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none",
        selected && "bg-accent-soft/70",
        disabled && "cursor-not-allowed opacity-50",
      )}
      tabIndex={disabled ? undefined : 0}
      onClick={() => {
        if (disabled) return;
        onToggle();
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-surface text-transparent",
        )}
        aria-hidden
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {routine.name}
          </p>
          <span className="text-[11px] font-semibold text-muted">
            {formatSchedule(routine)}
          </span>
        </div>
        {routine.drafts.length === 0 ? (
          <p className="mt-0.5 text-xs text-muted">No drafts</p>
        ) : (
          <p className="mt-0.5 truncate text-xs text-muted">
            {draftPreview}
            {extra > 0 ? ` · +${extra} more` : ""}
          </p>
        )}
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-muted">
        {routine.drafts.length}
      </span>
    </li>
  );
};

export default ApplyRoutinesModal;
