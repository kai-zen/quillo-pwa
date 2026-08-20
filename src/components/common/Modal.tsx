"use client";

import { X } from "lucide-react";
import { FC, ReactNode, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";
import IconButton from "./IconButton";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

const Modal: FC<Props> = ({ open, onClose, title, children, className }) => {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center sm:p-4">
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
          "relative z-10 flex max-h-[85vh] w-full flex-col rounded-t-xl border border-border bg-surface shadow-xl sm:max-w-md sm:rounded-xl",
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2
            id={titleId}
            className="text-base font-semibold tracking-tight text-foreground"
          >
            {title}
          </h2>
          <IconButton label="Close" size="sm" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
