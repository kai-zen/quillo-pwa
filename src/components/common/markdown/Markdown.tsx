"use client";

import { Check } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import Button from "../Button";
import { cn } from "../cn";
import { toggleMarkdownTask } from "./markdownEditorFormat";

interface Props {
  children: string;
  className?: string;
  compact?: boolean;
  onChange?: (value: string) => void;
}

const checkboxClass = (checked: boolean, interactive: boolean) =>
  cn(
    "inline-flex h-4 w-4 shrink-0 translate-y-0.5 items-center justify-center rounded border transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
    checked
      ? "border-foreground bg-foreground text-background"
      : "border-border bg-surface text-transparent",
    interactive
      ? "cursor-pointer hover:border-foreground/40"
      : "cursor-default",
  );

const markdownComponents = (
  source: string,
  onChange?: (value: string) => void,
): Components => {
  let taskIndex = 0;

  return {
    input: ({ type, checked }) => {
      if (type !== "checkbox") return <input type={type} />;

      const index = taskIndex++;
      const isChecked = !!checked;
      const interactive = !!onChange;

      if (!interactive) {
        return (
          <span
            role="checkbox"
            aria-checked={isChecked}
            aria-readonly="true"
            className={checkboxClass(isChecked, false)}
          >
            <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
          </span>
        );
      }

      return (
        <button
          type="button"
          role="checkbox"
          aria-checked={isChecked}
          aria-label={isChecked ? "Mark item incomplete" : "Mark item complete"}
          className={checkboxClass(isChecked, true)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onChange?.(toggleMarkdownTask(source, index));
          }}
        >
          <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </button>
      );
    },
  };
};

const Markdown: FC<Props> = ({
  children,
  className,
  compact = false,
  onChange,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    if (!compact || expanded) return;

    const element = contentRef.current;
    if (!element) return;

    const checkTruncation = () => {
      if (element.scrollHeight > element.clientHeight + 1) {
        setCanExpand(true);
      }
    };

    checkTruncation();

    const observer = new ResizeObserver(checkTruncation);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children, compact, expanded]);

  if (!children.trim()) return null;

  return (
    <div>
      <div
        ref={contentRef}
        className={cn(
          "markdown text-sm leading-relaxed text-foreground",
          "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-foreground",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-foreground",
          "[&_li]:my-0.5 [&_li]:text-foreground",
          "[&_ul.contains-task-list]:list-none [&_ul.contains-task-list]:pl-0",
          "[&_li.task-list-item]:grid [&_li.task-list-item]:grid-cols-[auto_1fr] [&_li.task-list-item]:gap-x-2",
          "[&_li.task-list-item>ul]:col-span-full [&_li.task-list-item>ul]:pl-5",
          "[&_li.task-list-item:has(>[aria-checked=true])]:text-muted",
          "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted",
          "[&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-muted",
          "[&_code]:rounded [&_code]:bg-accent-soft [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
          "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-accent-soft [&_pre]:p-3",
          "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
          "[&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold",
          "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground",
          "[&_h3]:mb-1.5 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-medium",
          "[&_hr]:my-4 [&_hr]:h-px [&_hr]:border-0 [&_hr]:bg-border",
          "[&_strong]:font-semibold",
          "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse text-left",
          "[&_th]:border [&_th]:border-border [&_th]:bg-accent-soft [&_th]:px-2 [&_th]:py-1",
          "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
          compact && "text-muted [&_p]:my-0",
          compact && !expanded && "line-clamp-3",
          className,
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={markdownComponents(children, onChange)}
        >
          {children}
        </ReactMarkdown>
      </div>
      {compact && canExpand ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Show more..."}
        </Button>
      ) : null}
    </div>
  );
};

export default Markdown;
