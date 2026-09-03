"use client";

import { Check, Folder, FolderMinus, FolderPlus, Plus } from "lucide-react";
import { FC, MouseEvent } from "react";
import { Button, cn } from "@/components/common";
import type { NoteFolder, RecordId } from "@/shared/types";
import {
  useNoteFolderPicker,
  type FolderPickerOption,
} from "./useNoteFolderPicker";

interface Props {
  noteTitle: string;
  folderId: RecordId | null;
  folders: NoteFolder[];
  disabled?: boolean;
  onMove: (folderId: RecordId | null) => void | Promise<void>;
  onCreateAndMove: (name: string) => void | Promise<void>;
}

const optionIcon = (kind: FolderPickerOption["kind"]) => {
  if (kind === "unfiled") return FolderMinus;
  if (kind === "create") return Plus;
  return Folder;
};

const NoteFolderPicker: FC<Props> = ({
  noteTitle,
  folderId,
  folders,
  disabled,
  onMove,
  onCreateAndMove,
}) => {
  const {
    rootRef,
    popoverRef,
    listRef,
    searchRef,
    listboxId,
    triggerId,
    searchId,
    open,
    query,
    setQuery,
    placement,
    activeIndex,
    setActiveIndex,
    options,
    selectedValue,
    folderName,
    filed,
    pending,
    toggleOpen,
    onTriggerKeyDown,
    onSearchKeyDown,
    commit,
  } = useNoteFolderPicker({
    folderId,
    folders,
    disabled,
    onMove,
    onCreateAndMove,
  });

  const busy = disabled || pending;
  const label = filed
    ? `Move “${noteTitle}”`
    : `Add “${noteTitle}” to a folder`;

  const stopCardOpen = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <div ref={rootRef} className="relative min-w-0" onClick={stopCardOpen}>
      <Button
        id={triggerId}
        variant="secondary"
        size="sm"
        disabled={busy}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={toggleOpen}
        onKeyDown={onTriggerKeyDown}
        startIcon={
          filed ? (
            <Folder className="h-3.5 w-3.5" />
          ) : (
            <FolderPlus className="h-3.5 w-3.5" />
          )
        }
        className={cn(
          "min-w-0 max-w-full justify-start",
          open && "bg-accent-soft text-foreground",
        )}
      >
        <span className="min-w-0 truncate">
          {filed ? folderName : "Add to folder"}
        </span>
      </Button>

      {open && (
        <div
          ref={popoverRef}
          className={cn(
            "absolute left-0 z-50 w-56 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface shadow-lg shadow-black/10 dark:shadow-black/50",
            placement === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
          )}
        >
          <div className="border-b border-border p-1.5">
            <input
              ref={searchRef}
              id={searchId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search or create…"
              disabled={pending}
              aria-label="Search folders"
              aria-controls={listboxId}
              aria-autocomplete="list"
              className="w-full rounded-md border border-border bg-transparent px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-muted focus:border-foreground disabled:opacity-50"
            />
          </div>

          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            className="max-h-52 overflow-auto py-1"
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted">
                {folders.length === 0
                  ? "Type a name to create a folder."
                  : "No matching folders."}
              </li>
            ) : (
              options.map((option, index) => {
                const Icon = optionIcon(option.kind);
                const selected = option.value === selectedValue;
                const active = index === activeIndex;

                return (
                  <li
                    key={`${option.kind}-${option.value}`}
                    role="option"
                    aria-selected={selected}
                    data-index={index}
                    className={
                      option.kind === "unfiled"
                        ? "mb-1 border-b border-border/70 pb-1"
                        : undefined
                    }
                  >
                    <button
                      type="button"
                      disabled={pending}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 px-2.5 py-1.5 text-left text-xs text-foreground",
                        active && "bg-accent-soft",
                        selected && !active && "bg-accent-soft/70",
                        option.kind === "unfiled" && "text-muted",
                        pending && "cursor-not-allowed opacity-50",
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => void commit(option.value)}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      {selected && (
                        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NoteFolderPicker;
