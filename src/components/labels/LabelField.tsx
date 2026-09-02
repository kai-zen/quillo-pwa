"use client";

import { Plus, X } from "lucide-react";
import {
  FC,
  KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, cn } from "@/components/common";
import {
  resolvePopoverPlacement,
  type PopoverPlacement,
} from "@/components/common/placement";
import type { Label, RecordId } from "@/shared/types";

interface Props {
  labels: Label[];
  selectedIds: RecordId[];
  onChange: (ids: RecordId[]) => void;
  onCreate: (draftName: string) => void;
}

const LabelField: FC<Props> = ({ labels, selectedIds, onChange, onCreate }) => {
  const inputId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = labels.filter((label) => selectedIds.includes(label._id));

  const available = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return labels.filter((label) => {
      if (selectedIds.includes(label._id)) return false;
      if (!needle) return true;
      return label.name.toLowerCase().includes(needle);
    });
  }, [labels, selectedIds, query]);

  const close = () => setOpen(false);

  const updatePlacement = () => {
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;
    setPlacement(resolvePopoverPlacement(trigger, list));
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

  const add = (id: RecordId) => {
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setQuery("");
    setActiveIndex(0);
  };

  const remove = (id: RecordId) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !query && selectedIds.length > 0) {
      event.preventDefault();
      remove(selectedIds[selectedIds.length - 1]);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setPlacement("bottom");
      setOpen(true);
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
        add(match._id);
        return;
      }
      onCreate(query);
      setQuery("");
      close();
      return;
    }

    if (event.key === "Escape") {
      close();
    }
  };

  return (
    <div ref={rootRef}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="block text-sm text-muted">
          Labels
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            close();
            onCreate(query);
            setQuery("");
          }}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Create label
        </Button>
      </div>

      <div
        ref={triggerRef}
        className={cn(
          "relative flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-transparent px-2 py-1.5",
          "focus-within:border-foreground",
        )}
      >
        {selected.map((label) => (
          <span
            key={label._id}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-accent-soft px-2 py-0.5 text-xs text-foreground"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: label.color }}
              aria-hidden
            />
            {label.name}
            <button
              type="button"
              aria-label={`Remove ${label.name}`}
              onClick={() => remove(label._id)}
              className="cursor-pointer text-muted hover:text-foreground"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPlacement("bottom");
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => {
            setPlacement("bottom");
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder={
            selected.length > 0 ? "Add another label…" : "Search labels"
          }
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
                {query.trim()
                  ? `No label named “${query.trim()}”. Create one instead.`
                  : "No labels yet. Create a label to get started."}
              </li>
            ) : (
              available.map((label, index) => (
                <li
                  key={label._id}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-foreground",
                      index === activeIndex && "bg-accent-soft",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      add(label._id);
                      close();
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: label.color }}
                      aria-hidden
                    />
                    {label.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LabelField;
