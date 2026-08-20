import { ButtonHTMLAttributes, FC } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  sm: "px-3 py-1.5 text-sm",
  md: "px-3 py-2 text-sm",
};

const Button: FC<Props> = ({
  variant = "primary",
  size = "md",
  className,
  type = "button",
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
    />
  );
};

export default Button;
