"use client";

import { Plus, X } from "lucide-react";
import { Fragment } from "react";
import Button from "../Button";
import { cn } from "../cn";
import {
  useCombobox,
  type ComboboxOption,
  type ComboboxProps,
} from "./useCombobox";

export type { ComboboxOption, ComboboxProps } from "./useCombobox";

const DefaultChip = <TData,>({
  option,
  onRemove,
}: {
  option: ComboboxOption<TData>;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-accent-soft px-2 py-0.5 text-xs text-foreground">
    {option.label}
    <button
      type="button"
      aria-label={`Remove ${option.label}`}
      onClick={onRemove}
      className="cursor-pointer text-muted hover:text-foreground"
    >
      <X className="h-3 w-3" aria-hidden />
    </button>
  </span>
);

const Combobox = <TData,>({
  options,
  value,
  onChange,
  onCreate,
  id,
  disabled,
  filter,
  label,
  placeholder = "Search",
  selectedPlaceholder = "Add another…",
  createButtonLabel,
  emptyContent,
  renderOption,
  renderChip,
  className,
}: ComboboxProps<TData>) => {
  const {
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
    remove,
    selectOption,
    createFromQuery,
    onQueryChange,
    onInputKeyDown,
    openMenu,
    setActiveIndex,
  } = useCombobox({
    options,
    value,
    onChange,
    onCreate,
    id,
    disabled,
    filter,
  });

  const showHeader = label != null || (onCreate && createButtonLabel);

  return (
    <div ref={rootRef} className={className}>
      {showHeader && (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          {label != null ? (
            <label htmlFor={inputId} className="block text-sm text-muted">
              {label}
            </label>
          ) : (
            <span />
          )}
          {onCreate && createButtonLabel != null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => createFromQuery()}
              disabled={disabled}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {createButtonLabel}
            </Button>
          )}
        </div>
      )}

      <div
        ref={triggerRef}
        className={cn(
          "relative flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-transparent px-2 py-1.5",
          "focus-within:border-foreground",
          disabled && "opacity-50",
        )}
      >
        {selected.map((option) => {
          const onRemove = () => remove(option.value);
          return (
            <Fragment key={option.value}>
              {renderChip ? (
                renderChip(option, { onRemove })
              ) : (
                <DefaultChip option={option} onRemove={onRemove} />
              )}
            </Fragment>
          );
        })}
        <input
          id={inputId}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => openMenu()}
          onKeyDown={onInputKeyDown}
          placeholder={selected.length > 0 ? selectedPlaceholder : placeholder}
          disabled={disabled}
          className="min-w-28 flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
        />

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            className={cn(
              "absolute left-0 z-50 max-h-48 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg shadow-black/10 dark:shadow-black/50",
              placement === "bottom" ? "top-full mt-1.5" : "bottom-full mb-1.5",
            )}
          >
            {available.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">
                {emptyContent?.(query) ??
                  (query.trim()
                    ? `No matches for “${query.trim()}”.`
                    : "No options.")}
              </li>
            ) : (
              available.map((option, index) => {
                const active = index === activeIndex;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={active}
                    data-index={index}
                  >
                    <button
                      type="button"
                      disabled={option.disabled}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-foreground",
                        active && "bg-accent-soft",
                        option.disabled && "cursor-not-allowed opacity-40",
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectOption(option.value, true)}
                    >
                      {renderOption ? (
                        renderOption(option, { active })
                      ) : (
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Combobox;
