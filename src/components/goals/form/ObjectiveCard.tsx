import { FC, KeyboardEvent } from "react";
import { ObjectiveFormItem } from "./useGoalForm";
import { ChevronDown, Trash2 } from "lucide-react";
import {
  cn,
  Field,
  IconButton,
  Input,
  MarkdownEditor,
} from "@/components/common";

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
            <MarkdownEditor
              value={objective.description}
              onChange={(val) => onUpdate({ description: val })}
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

export default ObjectiveCard;
