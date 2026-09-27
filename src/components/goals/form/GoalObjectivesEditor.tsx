"use client";

import { Plus } from "lucide-react";
import { FC, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/common";
import type { ObjectiveFormItem } from "./useGoalForm";
import ObjectiveCard from "./ObjectiveCard";

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

export default GoalObjectivesEditor;
