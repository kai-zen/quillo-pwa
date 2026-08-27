import { cn } from "@/components/common";
import { Routine } from "@/shared/types";
import { Check } from "lucide-react";
import { FC } from "react";
import { formatSchedule } from "../helpers";

interface Props {
  routine: Routine;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

const RoutineOption: FC<Props> = ({
  routine,
  selected,
  disabled,
  onToggle,
}) => {
  const draftPreview = routine.drafts
    .map((draft) => draft.title)
    .filter(Boolean)
    .slice(0, 4)
    .join(" · ");
  const extra = Math.max(0, routine.drafts.length - 4);

  return (
    <li
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex cursor-pointer items-start gap-3 border-b border-border px-3 py-2.5 last:border-b-0 transition-colors",
        "hover:bg-accent-soft focus-visible:bg-accent-soft focus-visible:outline-none",
        selected && "bg-accent-soft/70",
        disabled && "cursor-not-allowed opacity-50",
      )}
      tabIndex={disabled ? undefined : 0}
      onClick={() => {
        if (disabled) return;
        onToggle();
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle();
        }
      }}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-surface text-transparent",
        )}
        aria-hidden
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {routine.name}
          </p>
          <span className="text-[11px] font-semibold text-muted">
            {formatSchedule(routine)}
          </span>
        </div>
        {routine.drafts.length === 0 ? (
          <p className="mt-0.5 text-xs text-muted">No drafts</p>
        ) : (
          <p className="mt-0.5 truncate text-xs text-muted">
            {draftPreview}
            {extra > 0 ? ` · +${extra} more` : ""}
          </p>
        )}
      </div>
      <span className="shrink-0 text-xs font-medium tabular-nums text-muted">
        {routine.drafts.length}
      </span>
    </li>
  );
};

export default RoutineOption;
