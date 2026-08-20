import { FC, SelectHTMLAttributes } from "react";
import { cn } from "./cn";

type SelectSize = "sm" | "md";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  sizeVariant?: SelectSize;
}

const sizeClass: Record<SelectSize, string> = {
  sm: "rounded-md px-2 py-1.5 text-xs",
  md: "rounded-lg px-3 py-2 text-sm",
};

const Select: FC<Props> = ({
  className,
  sizeVariant = "md",
  ...props
}) => {
  return (
    <select
      className={cn(
        "border border-border bg-transparent outline-none focus:border-foreground disabled:opacity-50",
        sizeClass[sizeVariant],
        className,
      )}
      {...props}
    />
  );
};

export default Select;
