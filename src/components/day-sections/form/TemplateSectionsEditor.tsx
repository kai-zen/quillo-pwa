"use client";

import { Plus } from "lucide-react";
import { FC, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/common";
import type { SectionFormItem } from "./useSectionTemplateForm";
import SectionRow from "./SectionRow";

interface Props {
  sections: SectionFormItem[];
  disabled?: boolean;
  onAdd: () => string;
  onRemove: (key: string) => void;
  onUpdate: (key: string, title: string) => void;
}

const TemplateSectionsEditor: FC<Props> = ({
  sections,
  disabled,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  const [focusTick, setFocusTick] = useState(0);
  const pendingFocusKey = useRef<string | null>(null);

  const addSection = () => {
    const key = onAdd();
    pendingFocusKey.current = key;
    setFocusTick((tick) => tick + 1);
  };

  useLayoutEffect(() => {
    const key = pendingFocusKey.current;
    if (!key) return;
    pendingFocusKey.current = null;
    document.getElementById(`template-section-${key}`)?.focus({
      preventScroll: true,
    });
  }, [focusTick]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted">Sections</p>
        <span className="text-xs font-medium tabular-nums text-muted">
          {sections.length}
        </span>
      </div>

      {sections.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          Add sections to define this day structure.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sections.map((section, index) => (
            <SectionRow
              key={section.key}
              index={index}
              section={section}
              disabled={disabled}
              onRemove={() => onRemove(section.key)}
              onUpdate={(title) => onUpdate(section.key, title)}
              onAddNext={addSection}
            />
          ))}
        </ul>
      )}

      <Button
        variant="secondary"
        onClick={addSection}
        disabled={disabled}
        startIcon={<Plus className="h-3.5 w-3.5" aria-hidden />}
        className="w-full border-dashed"
      >
        Add section
      </Button>
    </div>
  );
};

export default TemplateSectionsEditor;
