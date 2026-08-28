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
    className={cn(
      "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md text-muted transition-colors hover:text-foreground",
      size === "sm" ? "text-xs" : "text-sm",
      className,
    )}
  >
    <Target
      className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")}
      aria-hidden
    />
    <span className="truncate">{goal.title}</span>
  </Link>
);

export default SprintGoalLink;
