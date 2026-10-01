import { FC, KeyboardEvent } from "react";
import { SectionFormItem } from "./useSectionTemplateForm";
import { Field, IconButton, Input } from "@/components/common";
import { Trash2 } from "lucide-react";

interface SectionRowProps {
  index: number;
  section: SectionFormItem;
  disabled?: boolean;
  onRemove: () => void;
  onUpdate: (title: string) => void;
  onAddNext: () => void;
}

const SectionRow: FC<SectionRowProps> = ({
  index,
  section,
  disabled,
  onRemove,
  onUpdate,
  onAddNext,
}) => {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (section.title.trim()) onAddNext();
  };

  return (
    <li className="flex items-center gap-2">
      <Input
        id={`template-section-${section.key}`}
        value={section.title}
        onChange={(e) => onUpdate(e.target.value)}
        onKeyDown={onKeyDown}
        maxLength={120}
        disabled={disabled}
        placeholder="07:00, Morning, Work…"
      />
      <IconButton
        label={`Remove section ${index + 1}`}
        size="sm"
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </IconButton>
    </li>
  );
};

export default SectionRow;
