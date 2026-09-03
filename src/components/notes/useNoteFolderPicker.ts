"use client";

import {
  KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  resolvePopoverPlacement,
  type PopoverPlacement,
} from "@/components/common/placement";
import type { NoteFolder, RecordId } from "@/shared/types";

export const CREATE_FOLDER_VALUE = "__create__";
export const UNFILED_FOLDER_VALUE = "";

export type FolderPickerOption = {
  value: string;
  label: string;
  kind: "unfiled" | "folder" | "create";
};

interface Args {
  folderId: RecordId | null;
  folders: NoteFolder[];
  disabled?: boolean;
  onMove: (folderId: RecordId | null) => void | Promise<void>;
  onCreateAndMove: (name: string) => void | Promise<void>;
}

export function useNoteFolderPicker({
  folderId,
  folders,
  disabled,
  onMove,
  onCreateAndMove,
}: Args) {
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;
  const triggerId = `${generatedId}-trigger`;
  const searchId = `${generatedId}-search`;

  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");
  const [activeIndex, setActiveIndex] = useState(0);
  const [pending, setPending] = useState(false);

  const filed = !!folderId;
  const trimmedQuery = query.trim();
  const selectedValue = folderId ?? UNFILED_FOLDER_VALUE;

  const options = useMemo<FolderPickerOption[]>(() => {
    const needle = trimmedQuery.toLowerCase();
    const matched = needle
      ? folders.filter((folder) => folder.name.toLowerCase().includes(needle))
      : folders;

    const next: FolderPickerOption[] = [];

    if (filed && !needle) {
      next.push({
        value: UNFILED_FOLDER_VALUE,
        label: "Remove from folder",
        kind: "unfiled",
      });
    }

    for (const folder of matched) {
      next.push({
        value: folder._id,
        label: folder.name,
        kind: "folder",
      });
    }

    const exactMatch = folders.some(
      (folder) => folder.name.toLowerCase() === needle,
    );
    if (trimmedQuery && !exactMatch) {
      next.push({
        value: CREATE_FOLDER_VALUE,
        label: `Create “${trimmedQuery}”`,
        kind: "create",
      });
    }

    return next;
  }, [filed, folders, trimmedQuery]);

  const folderName =
    folders.find((folder) => folder._id === folderId)?.name ??
    (folderId ? "Folder" : "");

  const highlightedIndex =
    options.length === 0
      ? -1
      : Math.min(activeIndex, options.length - 1);

  const close = () => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  };

  const updatePlacement = () => {
    const trigger = rootRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;
    setPlacement(resolvePopoverPlacement(trigger, popover));
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePlacement();
    searchRef.current?.focus();
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
    };

    const onReposition = () => updatePlacement();

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("resize", onReposition);
    document.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("resize", onReposition);
      document.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open || highlightedIndex < 0) return;
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${highlightedIndex}"]`,
    );
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  const openMenu = () => {
    if (disabled || pending) return;
    const selectedIndex = options.findIndex(
      (option) => option.value === selectedValue,
    );
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setPlacement("bottom");
    setOpen(true);
  };

  const toggleOpen = () => {
    if (disabled || pending) return;
    if (open) close();
    else openMenu();
  };

  const commit = async (value: string) => {
    if (disabled || pending) return;

    if (value === CREATE_FOLDER_VALUE) {
      if (!trimmedQuery) return;
      setPending(true);
      try {
        await onCreateAndMove(trimmedQuery);
        close();
      } finally {
        setPending(false);
      }
      return;
    }

    const nextFolderId = value || null;
    if (nextFolderId === folderId) {
      close();
      return;
    }

    setPending(true);
    try {
      await onMove(nextFolderId);
      close();
    } finally {
      setPending(false);
    }
  };

  const moveActive = (direction: 1 | -1) => {
    if (options.length === 0) return;
    const from =
      highlightedIndex >= 0 ? highlightedIndex : direction === 1 ? -1 : 0;
    setActiveIndex((from + direction + options.length) % options.length);
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || pending) return;

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (!open) openMenu();
    }
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = options[highlightedIndex];
      if (option) void commit(option.value);
    }
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    setActiveIndex(0);
  };

  return {
    rootRef,
    popoverRef,
    listRef,
    searchRef,
    listboxId,
    triggerId,
    searchId,
    open,
    query,
    setQuery: onQueryChange,
    placement,
    activeIndex: highlightedIndex,
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
  };
}
