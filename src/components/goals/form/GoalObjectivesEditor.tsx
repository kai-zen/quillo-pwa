"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { FC, KeyboardEvent, useLayoutEffect, useRef, useState } from "react";
import {
  Button,
  Field,
  IconButton,
  Input,
  Textarea,
  cn,
} from "@/components/common";
import type { ObjectiveFormItem } from "./useGoalForm";

interface Props {
  objectives: ObjectiveFormItem[];
  disabled?: boolean;
  onAdd: () => string;
  onRemove: (key: string) => void;
  onUpdate: (key: string, patch: Partial<ObjectiveFormItem>) => void;
}

const GoalObjectivesEditor: FC<Props> = ({
  objectives,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(
    () => objectives.find((item) => !item.title.trim())?.key ?? null,
  );
  const [focusTick, setFocusTick] = useState(0);
  const pendingFocusKey = useRef<string | null>(null);

  const addObjective = () => {
    const key = onAdd();
    pendingFocusKey.current = key;
    setExpandedKey(key);
    setFocusTick((tick) => tick + 1);
  };

  useLayoutEffect(() => {
    const key = pendingFocusKey.current;
    if (!key) return;
    pendingFocusKey.current = null;
    document
      .getElementById(`goal-objective-title-${key}`)
      ?.focus({ preventScroll: true });
    document.getElementById(`goal-objective-${key}`)?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [focusTick]);

  const removeObjective = (key: string) => {
    if (expandedKey === key) {
      const remaining = objectives.filter((item) => item.key !== key);
      setExpandedKey(remaining.at(-1)?.key ?? null);
    }
    onRemove(key);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">Objectives</p>
        <span className="text-xs font-medium tabular-nums text-muted">
          {objectives.length}
        </span>
      </div>

      {objectives.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Add objectives to break this goal into checkable steps.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {objectives.map((objective, index) => (
            <ObjectiveCard
              key={objective.key}
              index={index}
              objective={objective}
              disabled={disabled}
              expanded={expandedKey === objective.key}
              onToggle={() =>
                setExpandedKey((current) =>
                  current === objective.key ? null : objective.key,
                )
              }
              onRemove={() => removeObjective(objective.key)}
              onUpdate={(patch) => onUpdate(objective.key, patch)}
              onAddNext={addObjective}
            />
          ))}
        </ul>
      )}

      <Button
        variant="secondary"
        onClick={addObjective}
        disabled={disabled}
        startIcon={<Plus className="h-3.5 w-3.5" aria-hidden />}
        className="w-full border-dashed"
      >
        Add objective
      </Button>
    </div>
  );
};

interface ObjectiveCardProps {
  index: number;
  objective: ObjectiveFormItem;
  disabled?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<ObjectiveFormItem>) => void;
  onAddNext: () => void;
}

const ObjectiveCard: FC<ObjectiveCardProps> = ({
  index,
  objective,
  disabled,
  expanded,
  onToggle,
  onRemove,
  onUpdate,
  onAddNext,
}) => {
  const titleId = `goal-objective-title-${objective.key}`;
  const fieldsId = `goal-objective-fields-${objective.key}`;
  const title = objective.title.trim();

  const onTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (objective.title.trim()) onAddNext();
  };

  return (
    <li
      id={`goal-objective-${objective.key}`}
      className="rounded-xl border border-border"
    >
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={expanded ? fieldsId : undefined}
          disabled={disabled}
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left hover:bg-accent-soft/60 disabled:cursor-not-allowed"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted transition-transform",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm font-medium",
              title ? "text-foreground" : "text-muted",
              objective.completed && "line-through opacity-70",
            )}
          >
            {title || `Objective ${index + 1}`}
          </span>
        </button>
        <IconButton
          label={`Remove objective ${index + 1}`}
          size="sm"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
      </div>

      {expanded && (
        <div
          id={fieldsId}
          className="flex flex-col gap-3 border-t border-border px-3 py-3"
        >
          <Field label="Title" htmlFor={titleId}>
            <Input
              id={titleId}
              value={objective.title}
              onChange={(event) => onUpdate({ title: event.target.value })}
              onKeyDown={onTitleKeyDown}
              maxLength={200}
              placeholder="Objective title"
              disabled={disabled}
            />
          </Field>

          <Field label="Description">
            <Textarea
              value={objective.description}
              onChange={(event) =>
                onUpdate({ description: event.target.value })
              }
              rows={2}
              maxRows={4}
              placeholder="Notes for this step…"
              disabled={disabled}
            />
          </Field>
        </div>
      )}
    </li>
  );
};

export default GoalObjectivesEditor;
