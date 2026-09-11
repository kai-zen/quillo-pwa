"use client";

import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { resolvePopoverPlacement, type PopoverPlacement } from "../placement";

export interface ComboboxOption<TData = unknown> {
  value: string;
  label: string;
  disabled?: boolean;
  data?: TData;
}

export const defaultComboboxFilter = <TData>(
  option: ComboboxOption<TData>,
  query: string,
  selected: string[],
): boolean => {
  if (selected.includes(option.value) || option.disabled) return false;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return option.label.toLowerCase().includes(needle);
};

export interface UseComboboxArgs<TData = unknown> {
  options: ComboboxOption<TData>[];
  value: string[];
  onChange: (value: string[]) => void;
  onCreate?: (query: string) => void;
  id?: string;
  disabled?: boolean;
  filter?: (
    option: ComboboxOption<TData>,
    query: string,
    selected: string[],
  ) => boolean;
}

const useCombobox = <TData = unknown>({
  options,
  value,
  onChange,
  onCreate,
  id,
  disabled,
  filter = defaultComboboxFilter,
}: UseComboboxArgs<TData>) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${generatedId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = useMemo(
    () =>
      value
        .map((id) => options.find((option) => option.value === id))
        .filter((option): option is ComboboxOption<TData> => !!option),
    [options, value],
  );

  const available = useMemo(
    () => options.filter((option) => filter(option, query, value)),
    [options, query, value, filter],
  );

  const close = () => setOpen(false);

  const clearQuery = () => {
    setQuery("");
    setActiveIndex(0);
  };

  const updatePlacement = () => {
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;
    setPlacement(resolvePopoverPlacement(trigger, list));
  };

  const openMenu = () => {
    if (disabled) return;
    setPlacement("bottom");
    setOpen(true);
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePlacement();
  }, [open, available.length]);

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
    if (!open || activeIndex < 0) return;
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const add = (nextId: string) => {
    if (value.includes(nextId) || disabled) return;
    onChange([...value, nextId]);
    clearQuery();
  };

  const remove = (nextId: string) => {
    if (disabled) return;
    onChange(value.filter((item) => item !== nextId));
  };

  const selectOption = (nextId: string) => {
    add(nextId);
  };

  const createFromQuery = () => {
    if (!onCreate) return;
    onCreate(query);
    clearQuery();
    close();
  };

  const onQueryChange = (next: string) => {
    setQuery(next);
    setActiveIndex(0);
    openMenu();
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "Backspace" && !query && value.length > 0) {
      event.preventDefault();
      remove(value[value.length - 1]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu();
      setActiveIndex((current) =>
        available.length === 0
          ? 0
          : Math.min(current + 1, available.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const match = available[activeIndex];
      if (match) {
        selectOption(match.value);
        return;
      }
      createFromQuery();
      return;
    }

    if (event.key === "Escape") {
      close();
    }
  };

  return {
    inputId,
    listId,
    rootRef,
    triggerRef,
    listRef,
    query,
    open,
    placement,
    activeIndex,
    selected,
    available,
    disabled: !!disabled,
    close,
    clearQuery,
    openMenu,
    add,
    remove,
    selectOption,
    createFromQuery,
    onQueryChange,
    onInputKeyDown,
    setActiveIndex,
  };
};

export type ComboboxRenderState = { active: boolean };

export interface ComboboxProps<TData = unknown> extends UseComboboxArgs<TData> {
  label?: ReactNode;
  placeholder?: string;
  selectedPlaceholder?: string;
  createButtonLabel?: ReactNode;
  emptyContent?: (query: string) => ReactNode;
  renderOption?: (
    option: ComboboxOption<TData>,
    state: ComboboxRenderState,
  ) => ReactNode;
  renderChip?: (
    option: ComboboxOption<TData>,
    actions: { onRemove: () => void },
  ) => ReactNode;
  className?: string;
}

export default useCombobox;
