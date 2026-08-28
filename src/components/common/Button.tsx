import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background transition-opacity hover:opacity-90 disabled:opacity-50",
  secondary:
    "border border-border text-foreground transition-colors hover:bg-accent-soft disabled:opacity-50",
  ghost:
    "text-muted transition-colors hover:text-foreground disabled:opacity-50",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-2 py-1.5 text-sm",
  md: "px-3 py-2 text-sm",
};

const Button: FC<Props> = ({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  startIcon,
  endIcon,
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {startIcon && <span aria-hidden>{startIcon}</span>}
      {children}
      {endIcon && <span aria-hidden>{endIcon}</span>}
    </button>
  );
};

export default Button;
