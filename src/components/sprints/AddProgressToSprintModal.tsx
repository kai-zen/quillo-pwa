"use client";

import { Check, Search } from "lucide-react";
import { FC, useId } from "react";
import { Button, Input, Modal, cn } from "@/components/common";
import { PROGRESS_INPUT_TYPE_LABELS } from "@/components/progresses/helpers";
import type { Progress, Sprint } from "@/shared/types";
import { useAddProgressToSprint } from "./hooks/useAddProgressToSprint";

interface Props {
  open: boolean;
  sprint: Sprint;
  onClose: () => void;
}

const AddProgressToSprintModal: FC<Props> = ({ open, sprint, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Add progress to sprint"
    className="max-w-2xl"
  >
    {open && <AddProgressToSprintBody sprint={sprint} onClose={onClose} />}
  </Modal>
);

const AddProgressToSprintBody: FC<Omit<Props, "open">> = ({
  sprint,
  onClose,
}) => {
  const searchId = useId();
  const view = useAddProgressToSprint(sprint, onClose);
  const {
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
    pending,
    error,
    toggle,
    toggleAllVisible,
    onSubmit,
  } = view;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Choose existing trackers to follow during this sprint.
      </p>

      <div className="relative min-w-0">
        <label htmlFor={searchId} className="sr-only">
          Search progress
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          id={searchId}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title"
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

      {isLoading && <p className="text-sm text-muted">Loading progress…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load progress. Try closing and opening this again.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
          <p className="font-medium text-foreground">No progress to add</p>
          <p className="mt-1 text-sm text-muted">
            Every tracker is already on this sprint, or you have none yet.
            Create them on the Progress page.
          </p>
        </div>
      )}

      {isFilterEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
          <p className="font-medium text-foreground">No matching progress</p>
          <p className="mt-1 text-sm text-muted">Try a different title.</p>
        </div>
      )}

      {visible.length > 0 && (
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-label="Progress to add"
          className="max-h-[50vh] overflow-y-auto rounded-xl border border-border"
        >
          {visible.map((progress) => (
            <ProgressOption
              key={progress._id}
              progress={progress}
              selected={selectedIds.has(progress._id)}
              disabled={pending}
              onToggle={() => toggle(progress._id)}
            />
          ))}
        </ul>
      )}

      {isTruncated && (
        <p className="text-xs text-muted">
          Showing the first 100 trackers. Ones already on this sprint are
          hidden.
        </p>
      )}

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={pending || selectedCount === 0}>
          {pending
            ? "Adding…"
            : selectedCount === 0
              ? "Add progress"
              : selectedCount === 1
                ? "Add 1 tracker"
                : `Add ${selectedCount} trackers`}
        </Button>
      </div>
    </div>
  );
};

interface ProgressOptionProps {
  progress: Progress;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

const ProgressOption: FC<ProgressOptionProps> = ({
  progress,
  selected,
  disabled,
  onToggle,
}) => (
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
      <p className="truncate text-sm font-medium text-foreground">
        {progress.title}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        {PROGRESS_INPUT_TYPE_LABELS[progress.input_type]}
      </p>
    </div>
  </li>
);

export default AddProgressToSprintModal;
