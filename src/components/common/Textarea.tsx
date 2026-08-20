import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
