"use client";

import { FC } from "react";
import { cn } from "@/components/common";
import type { SectionTemplate } from "@/shared/types";
import { formatSectionCount, sectionsFromTemplate } from "../helpers";

interface Props {
  template: SectionTemplate;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

const SectionTemplateOption: FC<Props> = ({
  template,
  selected,
  disabled,
  onSelect,
}) => {
  const sections = sectionsFromTemplate(template.sections);
  const preview = sections
    .slice(0, 4)
    .map((section) => section.title.trim() || "Untitled")
    .join(" · ");

  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        disabled={disabled}
        onClick={onSelect}
        className={cn(
          "flex w-full cursor-pointer flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0",
          selected ? "bg-accent-soft" : "hover:bg-accent-soft/50",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="font-medium text-foreground">{template.name}</span>
        <span className="text-xs text-muted">
          {formatSectionCount(sections.length)}
          {preview ? ` · ${preview}${sections.length > 4 ? "…" : ""}` : ""}
        </span>
      </button>
    </li>
  );
};

export default SectionTemplateOption;
