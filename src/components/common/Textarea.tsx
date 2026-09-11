"use client";

import {
  forwardRef,
  type Ref,
  type TextareaHTMLAttributes,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { cn } from "./cn";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Cap auto-grow height. Past this, the textarea scrolls. Default: 10. */
  maxRows?: number;
};

const assignRef = <T extends HTMLTextAreaElement | null>(
  ref: Ref<T> | undefined,
  value: T,
) => {
  if (!ref) return;
  if (typeof ref === "function") ref(value);
  else ref.current = value;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  (
    { className, maxRows = 10, rows = 3, onChange, style, ...props },
    forwardedRef,
  ) => {
    const localRef = useRef<HTMLTextAreaElement | null>(null);

    const resize = useCallback(() => {
      const el = localRef.current;
      if (!el) return;

      el.style.height = "0px";

      const computed = getComputedStyle(el);
      const lineHeight = Number.parseFloat(computed.lineHeight) || 20;
      const paddingY =
        Number.parseFloat(computed.paddingTop) +
        Number.parseFloat(computed.paddingBottom);
      const borderY =
        Number.parseFloat(computed.borderTopWidth) +
        Number.parseFloat(computed.borderBottomWidth);

      const minRows = Number(rows) || 1;
      const minHeight = lineHeight * minRows + paddingY + borderY;
      const maxHeight = lineHeight * maxRows + paddingY + borderY;
      const scrollHeight = el.scrollHeight;
      const next = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      el.style.height = `${next}px`;
      el.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }, [maxRows, rows]);

    useLayoutEffect(() => {
      resize();
    }, [props.value, props.defaultValue, resize]);

    return (
      <textarea
        ref={(node) => {
          localRef.current = node;
          assignRef(forwardedRef, node);
        }}
        rows={rows}
        onChange={(event) => {
          onChange?.(event);
          resize();
        }}
        className={cn(
          "w-full resize-none overflow-hidden rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground disabled:opacity-50",
          className,
        )}
        style={style}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
