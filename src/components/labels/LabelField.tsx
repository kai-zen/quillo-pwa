"use client";

import { X } from "lucide-react";
import { FC, useMemo } from "react";
import { Combobox, type ComboboxOption } from "@/components/common";
import type { Label, RecordId } from "@/shared/types";

interface Props {
  labels: Label[];
  selectedIds: RecordId[];
  onChange: (ids: RecordId[]) => void;
  onCreate: (draftName: string) => void;
}

const LabelField: FC<Props> = ({ labels, selectedIds, onChange, onCreate }) => {
  const options = useMemo<ComboboxOption<Label>[]>(
    () =>
      labels.map((label) => ({
        value: label._id,
        label: label.name,
        data: label,
      })),
    [labels],
  );

  return (
    <Combobox
      options={options}
      value={selectedIds}
      onChange={onChange}
      onCreate={onCreate}
      label="Labels"
      placeholder="Search labels"
      selectedPlaceholder="Add another label…"
      createButtonLabel="Create label"
      emptyContent={(query) =>
        query.trim()
          ? `No label named “${query.trim()}”. Create one instead.`
          : "No labels yet. Create a label to get started."
      }
      renderOption={(option) => (
        <>
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: option.data?.color }}
            aria-hidden
          />
          {option.label}
        </>
      )}
      renderChip={(option, { onRemove }) => (
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-accent-soft px-2 py-0.5 text-xs text-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: option.data?.color }}
            aria-hidden
          />
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
      )}
    />
  );
};

export default LabelField;
