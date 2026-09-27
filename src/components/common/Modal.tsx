"use client";

import { X } from "lucide-react";
import { FC, ReactNode, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";
import IconButton from "./IconButton";

let openModalCount = 0;
let savedBodyOverflow: string | null = null;

interface Props {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
}

const Modal: FC<Props> = ({
  open,
  onClose,
  title,
  headerActions,
  children,
  className,
  overlayClassName,
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    openModalCount += 1;
    const depth = openModalCount;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && depth === openModalCount) onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // Lock scroll only for the first open modal; unlock only when none remain.
    if (openModalCount === 1) {
      savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      openModalCount -= 1;
      document.removeEventListener("keydown", onKeyDown);
      if (openModalCount === 0) {
        document.body.style.overflow = savedBodyOverflow ?? "";
        savedBodyOverflow = null;
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-end justify-center sm:items-center sm:p-4",
        overlayClassName ?? "z-80",
      )}
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/25 dark:bg-foreground/15"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-xl border border-border bg-surface shadow-xl md:max-w-2xl lg:max-w-3xl sm:rounded-xl",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2
            id={titleId}
            className="min-w-0 flex-1 text-base font-semibold tracking-tight text-foreground"
          >
            {title}
          </h2>
          <div className="flex shrink-0 items-center">
            {headerActions}
            <IconButton label="Close" size="sm" onClick={onClose}>
              <X className="h-4 w-4" aria-hidden />
            </IconButton>
          </div>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
