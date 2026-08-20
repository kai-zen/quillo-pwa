import { FC, InputHTMLAttributes } from "react";
import { cn } from "./cn";

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input: FC<Props> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
};

export default Input;
