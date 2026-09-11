import { ReactNode } from "react";
import { cn } from "./cn";

export interface StepperStep<T extends string | number = string> {
  value: T;
  label: ReactNode;
}

interface Props<T extends string | number> {
  value: T;
  steps: ReadonlyArray<StepperStep<T>>;
  className?: string;
  "aria-label": string;
}

const Stepper = <T extends string | number>({
  value,
  steps,
  className,
  "aria-label": ariaLabel,
}: Props<T>) => {
  const currentIndex = steps.findIndex((step) => step.value === value);

  return (
    <ol
      className={cn("flex items-center gap-2", className)}
      aria-label={ariaLabel}
    >
      {steps.map((item, index) => {
        const active = item.value === value;
        const complete = currentIndex > index;

        return (
          <li
            key={String(item.value)}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-2",
                active || complete ? "text-foreground" : "text-muted",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                  active && "bg-foreground text-background",
                  complete && "bg-foreground/15 text-foreground",
                  !active && !complete && "bg-accent-soft text-muted",
                )}
                aria-current={active ? "step" : undefined}
              >
                {index + 1}
              </span>
              <span className="truncate text-xs font-medium">{item.label}</span>
            </span>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  "h-px min-w-4 flex-1",
                  complete ? "bg-foreground/30" : "bg-border",
                )}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
