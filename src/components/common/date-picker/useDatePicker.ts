"use client";

import {
  KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  addMonths,
  isValidIsoDate,
  parseIsoDate,
  startOfMonth,
  todayIso,
  type DatePickerProps,
} from "./helpers";
import { resolvePopoverPlacement, type PopoverPlacement } from "../placement";

type UseDatePickerArgs = Pick<
  DatePickerProps,
  | "value"
  | "defaultValue"
  | "disabled"
  | "id"
  | "name"
  | "onChange"
  | "clearable"
  | "min"
  | "max"
>;

const useDatePicker = ({
  value,
  defaultValue,
  disabled,
  id,
  name,
  onChange,
  clearable = true,
  min,
  max,
}: UseDatePickerArgs) => {
  const generatedId = useId();
  const popoverId = `${generatedId}-popover`;
  const triggerId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isControlled = value !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? "",
  );
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");
  const [viewMonth, setViewMonth] = useState(() => {
    const initial = value ?? defaultValue ?? "";
    const parsed = parseIsoDate(initial);
    return startOfMonth(parsed ?? new Date());
  });

  const selectedValue = String(
    isControlled ? (value ?? "") : uncontrolledValue,
  );
  const selectedDate = parseIsoDate(selectedValue);

  const close = () => setOpen(false);

  const commit = (nextValue: string) => {
    if (nextValue && !isValidIsoDate(nextValue)) return;
    if (min && nextValue && nextValue < min) return;
    if (max && nextValue && nextValue > max) return;

    if (!isControlled) setUncontrolledValue(nextValue);
    onChange?.(nextValue);
    close();
  };

  const clear = () => {
    if (!clearable) return;
    commit("");
  };

  const selectToday = () => {
    const today = todayIso();
    if (min && today < min) return;
    if (max && today > max) return;
    commit(today);
    setViewMonth(startOfMonth(new Date()));
  };

  const updatePlacement = () => {
    const root = rootRef.current;
    const popover = popoverRef.current;
    if (!root || !popover) return;
    setPlacement(resolvePopoverPlacement(root, popover));
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePlacement();
  }, [open, viewMonth]);

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

  const openPopover = () => {
    if (disabled) return;
    const anchor = selectedDate ?? new Date();
    setViewMonth(startOfMonth(anchor));
    setPlacement("bottom");
    setOpen(true);
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (open) close();
    else openPopover();
  };

  const goPrevMonth = () => setViewMonth((month) => addMonths(month, -1));
  const goNextMonth = () => setViewMonth((month) => addMonths(month, 1));

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      if (!open) openPopover();
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  };

  return {
    rootRef,
    popoverRef,
    popoverId,
    triggerId,
    name,
    open,
    placement,
    selectedValue,
    selectedDate,
    viewMonth,
    clearable,
    min,
    max,
    toggleOpen,
    onTriggerKeyDown,
    goPrevMonth,
    goNextMonth,
    commit,
    clear,
    selectToday,
  };
};

export default useDatePicker;
