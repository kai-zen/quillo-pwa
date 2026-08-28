"use client";

import { Target } from "lucide-react";
import Link from "next/link";
import { FC, MouseEvent } from "react";
import { goalHref } from "@/components/goals/helpers";
import { cn } from "@/components/common";
import type { Goal } from "@/shared/types";

interface Props {
  goal: Goal;
  className?: string;
  size?: "sm" | "md";
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

const SprintGoalLink: FC<Props> = ({
  goal,
  className,
  size = "md",
  onClick,
}) => (
  <Link
    href={goalHref(goal)}
    onClick={onClick}
    aria-label={`Linked goal: ${goal.title}`}
    title={goal.title}
    className={cn(
      "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border border-border bg-accent-soft transition-colors hover:bg-accent-soft/70",
      size === "sm"
        ? "px-2 py-0.5 text-[11px] font-medium"
        : "px-2.5 py-1 text-sm font-medium",
      className,
    )}
  >
    <Target
      className={cn(
        "shrink-0 text-muted",
        size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
      )}
      aria-hidden
    />
    <span className="min-w-0 truncate text-foreground">
      <span className="text-muted">Goal</span>
      <span aria-hidden> · </span>
      {goal.title}
    </span>
  </Link>
);

export default SprintGoalLink;
