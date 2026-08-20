"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  resolvePopoverPlacement,
  type PopoverPlacement,
} from "../placement";
import { readOptions, type SelectOption, type SelectProps } from "./helpers";

type UseSelectArgs = Pick<
  SelectProps,
  | "children"
  | "value"
  | "defaultValue"
  | "disabled"
  | "id"
  | "name"
  | "onChange"
>;

export function useSelect({
  children,
  value,
  defaultValue,
  disabled,
  id,
  name,
  onChange,
}: UseSelectArgs) {
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;
  const triggerId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const options = readOptions(children);
  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    String(defaultValue ?? options[0]?.value ?? ""),
  );
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedValue = String(
    isControlled ? (value ?? "") : uncontrolledValue,
  );
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? null;

  const enabledIndexes = options
    .map((option, index) => (option.disabled ? -1 : index))
    .filter((index) => index >= 0);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const commit = (nextValue: string) => {
    if (!isControlled) setUncontrolledValue(nextValue);

    onChange?.({
      target: { value: nextValue, name: name ?? "" },
      currentTarget: { value: nextValue, name: name ?? "" },
    } as ChangeEvent<HTMLSelectElement>);

    close();
  };

  const updatePlacement = () => {
    const root = rootRef.current;
    const list = listRef.current;
    if (!root || !list) return;
    setPlacement(resolvePopoverPlacement(root, list));
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePlacement();
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
    if (!open || activeIndex < 0) return;
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    item?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const moveActive = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) return;

    const currentPos = enabledIndexes.indexOf(activeIndex);
    const nextPos =
      currentPos === -1
        ? direction === 1
          ? 0
          : enabledIndexes.length - 1
        : (currentPos + direction + enabledIndexes.length) %
          enabledIndexes.length;

    setActiveIndex(enabledIndexes[nextPos] ?? -1);
  };

  const openMenu = () => {
    const selectedIndex = options.findIndex(
      (option) => option.value === selectedValue && !option.disabled,
    );
    setActiveIndex(
      selectedIndex >= 0 ? selectedIndex : (enabledIndexes[0] ?? -1),
    );
    setPlacement("bottom");
    setOpen(true);
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (open) close();
    else openMenu();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      if (!open) {
        openMenu();
        return;
      }

      if (event.key === "ArrowDown") moveActive(1);
      if (event.key === "ArrowUp") moveActive(-1);
      if (
        (event.key === "Enter" || event.key === " ") &&
        activeIndex >= 0 &&
        options[activeIndex] &&
        !options[activeIndex].disabled
      ) {
        commit(options[activeIndex].value);
      }
    }
  };

  const setActiveOption = (index: number, option: SelectOption) => {
    if (!option.disabled) setActiveIndex(index);
  };

  return {
    rootRef,
    listRef,
    listboxId,
    triggerId,
    options,
    open,
    placement,
    activeIndex,
    selectedValue,
    selectedOption,
    toggleOpen,
    onTriggerKeyDown,
    setActiveOption,
    commit,
  };
}
