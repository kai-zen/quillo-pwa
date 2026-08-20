"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  ChangeEvent,
  FC,
  isValidElement,
  KeyboardEvent,
  ReactNode,
  SelectHTMLAttributes,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "./cn";

type SelectSize = "sm" | "md";

interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface Props extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size" | "children"
> {
  sizeVariant?: SelectSize;
  children?: ReactNode;
}

const triggerSizeClass: Record<SelectSize, string> = {
  sm: "min-h-8 rounded-md py-1.5 pl-2.5 pr-8 text-xs",
  md: "min-h-10 rounded-lg py-2 pl-3 pr-10 text-sm",
};

const chevronSizeClass: Record<SelectSize, string> = {
  sm: "right-2.5 h-3.5 w-3.5",
  md: "right-3.5 h-4 w-4",
};

const optionSizeClass: Record<SelectSize, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
};

const readOptions = (children: ReactNode): SelectOption[] => {
  const options: SelectOption[] = [];

  Children.forEach(children, (child) => {
    if (
      !isValidElement<{
        value?: string | number;
        disabled?: boolean;
        children?: ReactNode;
      }>(child)
    ) {
      return;
    }

    if (child.type !== "option") return;

    options.push({
      value: String(child.props.value ?? ""),
      label: child.props.children,
      disabled: !!child.props.disabled,
    });
  });

  return options;
};

const Select: FC<Props> = ({
  className,
  sizeVariant = "md",
  children,
  value,
  defaultValue,
  disabled,
  id,
  name,
  required,
  onChange,
  "aria-label": ariaLabel,
}) => {
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

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
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
    setOpen(true);
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

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <select
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute h-px w-px opacity-0"
        name={name}
        required={required}
        disabled={disabled}
        value={selectedValue}
        onChange={() => undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {typeof option.label === "string" ||
            typeof option.label === "number"
              ? option.label
              : option.value}
          </option>
        ))}
      </select>

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          if (disabled) return;
          if (open) close();
          else openMenu();
        }}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "relative flex w-full cursor-pointer items-center border border-border bg-surface text-left text-foreground shadow-sm outline-none transition-[border-color,box-shadow,background-color]",
          "hover:border-foreground/40 hover:bg-accent-soft/40",
          "focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/10",
          open && "border-foreground ring-2 ring-foreground/10",
          disabled && "cursor-not-allowed opacity-50 hover:bg-surface",
          triggerSizeClass[sizeVariant],
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            !selectedOption && "text-muted",
          )}
        >
          {selectedOption?.label ?? "Select…"}
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute text-muted transition-transform duration-150",
            chevronSizeClass[sizeVariant],
            open && "rotate-180 text-foreground",
          )}
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg shadow-black/10 dark:border-border dark:bg-surface dark:shadow-black/50"
        >
          {options.map((option, index) => {
            const selected = option.value === selectedValue;
            const active = index === activeIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={selected}
                aria-disabled={option.disabled || undefined}
                data-index={index}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 transition-colors",
                  optionSizeClass[sizeVariant],
                  option.disabled && "cursor-not-allowed opacity-40",
                  !option.disabled && active && "bg-accent-soft",
                  !option.disabled &&
                    selected &&
                    !active &&
                    "bg-accent-soft/70",
                  !option.disabled && "hover:bg-accent-soft",
                )}
                onMouseEnter={() => {
                  if (!option.disabled) setActiveIndex(index);
                }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (option.disabled) return;
                  commit(option.value);
                }}
              >
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {option.label}
                </span>
                {selected && (
                  <Check
                    aria-hidden
                    className="h-3.5 w-3.5 shrink-0 text-foreground"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
