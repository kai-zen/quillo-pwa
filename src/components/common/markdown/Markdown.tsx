"use client";

import { FC } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../cn";

interface Props {
  children: string;
  className?: string;
  compact?: boolean;
}

const Markdown: FC<Props> = ({ children, className, compact = false }) => {
  if (!children.trim()) return null;

  return (
    <div
      className={cn(
        "markdown text-sm text-foreground",
        "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:my-0.5",
        "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted",
        "[&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-muted",
        "[&_code]:rounded [&_code]:bg-accent-soft [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border [&_pre]:bg-accent-soft [&_pre]:p-3",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-base [&_h1]:font-semibold",
        "[&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold",
        "[&_h3]:mb-1.5 [&_h3]:mt-2 [&_h3]:text-sm [&_h3]:font-medium",
        "[&_hr]:my-3 [&_hr]:border-border",
        "[&_strong]:font-semibold",
        "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse text-left",
        "[&_th]:border [&_th]:border-border [&_th]:bg-accent-soft [&_th]:px-2 [&_th]:py-1",
        "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
        compact && "line-clamp-3 text-muted [&_p]:my-0",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
};

export default Markdown;
