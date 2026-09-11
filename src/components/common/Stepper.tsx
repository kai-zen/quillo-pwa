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
      className={cn("flex w-full min-w-0", className)}
      aria-label={ariaLabel}
    >
      {steps.map((item, index) => {
        const active = item.value === value;
        const complete = currentIndex > index;
        const isLast = index === steps.length - 1;

        return (
          <li
            key={String(item.value)}
            className="relative flex min-w-0 flex-1 flex-col items-center gap-1"
          >
            {!isLast && (
              <span
                className={cn(
                  "pointer-events-none absolute top-3 left-[calc(50%+0.875rem)] right-[calc(-50%+0.875rem)] h-px",
                  complete ? "bg-foreground/30" : "bg-border",
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                active && "bg-foreground text-background",
                complete && "bg-foreground/15 text-foreground",
                !active && !complete && "bg-accent-soft text-muted",
              )}
              aria-current={active ? "step" : undefined}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                "w-full px-0.5 text-center text-[11px] font-medium leading-tight break-words sm:text-xs",
                active || complete ? "text-foreground" : "text-muted",
              )}
            >
              {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
