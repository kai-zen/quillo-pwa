"use client";

import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { FC } from "react";
import { cn } from "../cn";
import IconButton from "../IconButton";
import type { ActiveFormats, FormatKind } from "./markdownEditorFormat";
import type { EditorTab } from "./useMarkdownEditor";

interface Props {
  tab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  active: ActiveFormats;
  disabled?: boolean;
  onFormat: (kind: FormatKind) => void;
}

const MarkdownEditorToolbar: FC<Props> = ({
  tab,
  onTabChange,
  active,
  disabled,
  onFormat,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-2 py-1.5">
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onTabChange("write")}
        className={cn(
          "cursor-pointer rounded-md px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          tab === "write"
            ? "bg-accent-soft font-medium text-foreground"
            : "text-muted hover:text-foreground",
        )}
      >
        Write
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onTabChange("preview")}
        className={cn(
          "cursor-pointer rounded-md px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          tab === "preview"
            ? "bg-accent-soft font-medium text-foreground"
            : "text-muted hover:text-foreground",
        )}
      >
        Preview
      </button>
    </div>

    {tab === "write" && (
      <div
        className="flex items-center gap-0.5"
        onMouseDown={(event) => event.preventDefault()}
      >
        <IconButton
          label="Bold"
          size="sm"
          disabled={disabled}
          active={active.bold}
          aria-pressed={active.bold}
          onClick={() => onFormat("bold")}
        >
          <Bold className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
        <IconButton
          label="Italic"
          size="sm"
          disabled={disabled}
          active={active.italic}
          aria-pressed={active.italic}
          onClick={() => onFormat("italic")}
        >
          <Italic className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
        <IconButton
          label="Heading"
          size="sm"
          disabled={disabled}
          active={active.heading}
          aria-pressed={active.heading}
          onClick={() => onFormat("heading")}
        >
          <Heading2 className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
        <IconButton
          label="Bullet list"
          size="sm"
          disabled={disabled}
          active={active.bulletList}
          aria-pressed={active.bulletList}
          onClick={() => onFormat("bulletList")}
        >
          <List className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
        <IconButton
          label="Numbered list"
          size="sm"
          disabled={disabled}
          active={active.orderedList}
          aria-pressed={active.orderedList}
          onClick={() => onFormat("orderedList")}
        >
          <ListOrdered className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
        <IconButton
          label="Inline code"
          size="sm"
          disabled={disabled}
          active={active.code}
          aria-pressed={active.code}
          onClick={() => onFormat("code")}
        >
          <Code className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
        <IconButton
          label="Link"
          size="sm"
          disabled={disabled}
          active={active.link}
          aria-pressed={active.link}
          onClick={() => onFormat("link")}
        >
          <LinkIcon className="h-3.5 w-3.5" aria-hidden />
        </IconButton>
      </div>
    )}
  </div>
);

export default MarkdownEditorToolbar;
