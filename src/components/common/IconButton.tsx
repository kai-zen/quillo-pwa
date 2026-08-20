import { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { cn } from "./cn";

type IconButtonSize = "sm" | "md";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: IconButtonSize;
  children: ReactNode;
}

const sizeClass: Record<IconButtonSize, string> = {
  sm: "rounded-md p-1.5",
  md: "rounded-lg p-2",
};

const IconButton: FC<Props> = ({
  label,
  size = "md",
  className,
  type = "button",
  children,
  title,
  ...props
}) => {
  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      className={cn(
        "cursor-pointer text-muted transition-colors hover:bg-accent-soft hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default IconButton;
