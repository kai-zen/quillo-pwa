import { cn } from "@/components/common";
import { FC } from "react";

const RING_SIZE = 40;
const RING_STROKE = 3.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface Props {
  percent: number;
  complete: boolean;
  label: string;
}

const SprintProgressRing: FC<Props> = ({ percent, complete, label }) => {
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div
      className="relative h-10 w-10 shrink-0"
      role="status"
      aria-label={label}
    >
      <svg
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="h-10 w-10 -rotate-90"
        aria-hidden
      >
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          className="stroke-accent-soft"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          className={cn(
            "transition-[stroke-dashoffset,stroke] duration-500 ease-out",
            complete
              ? "stroke-emerald-500"
              : clamped === 0
                ? "stroke-transparent"
                : "stroke-foreground",
          )}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold leading-none tabular-nums text-foreground">
        {clamped}%
      </span>
    </div>
  );
};

export default SprintProgressRing;
