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
import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../cn";
import IconButton from "../IconButton";
import Markdown from "./Markdown";
import Textarea from "../Textarea";
import {
  continueListOnEnter,
  detectFormats,
  EMPTY_FORMATS,
  type FormatKind,
  toggleOrWrap,
} from "./markdownEditorFormat";

type EditorTab = "write" | "preview";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
  compact?: boolean;
}

const MarkdownEditor: FC<Props> = ({
  value,
  onChange,
  placeholder = "Write markdown…",
  rows = 6,
  disabled,
  id,
  className,
  compact = false,
}) => {
  const [tab, setTab] = useState<EditorTab>("write");
  const [active, setActive] = useState(EMPTY_FORMATS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);
  const lastSelection = useRef({ start: 0, end: 0 });

  const syncActive = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setActive(EMPTY_FORMATS);
      return;
    }
    lastSelection.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
    setActive(
      detectFormats(
        textarea.value,
        textarea.selectionStart,
        textarea.selectionEnd,
      ),
    );
  };

  const commit = (
    next: string,
    selectionStart: number,
    selectionEnd: number,
  ) => {
    pendingSelection.current = { start: selectionStart, end: selectionEnd };
    lastSelection.current = { start: selectionStart, end: selectionEnd };
    onChange(next);
  };

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const pending = pendingSelection.current;
    if (!textarea || !pending) {
      syncActive();
      return;
    }

    textarea.focus();
    textarea.setSelectionRange(pending.start, pending.end);
    pendingSelection.current = null;
    lastSelection.current = pending;
    setActive(detectFormats(textarea.value, pending.start, pending.end));
  }, [value]);

  const run = (kind: FormatKind) => {
    if (disabled) return;
    setTab("write");

    const textarea = textareaRef.current;
    if (!textarea) return;

    if (document.activeElement !== textarea) {
      textarea.focus();
      textarea.setSelectionRange(
        lastSelection.current.start,
        lastSelection.current.end,
      );
    }

    const { next, selectionStart, selectionEnd } = toggleOrWrap(
      textarea.value,
      textarea.selectionStart,
      textarea.selectionEnd,
      kind,
    );
    commit(next, selectionStart, selectionEnd);
  };

  const onTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
    const target = event.target;
    lastSelection.current = {
      start: target.selectionStart,
      end: target.selectionEnd,
    };
    setActive(
      detectFormats(target.value, target.selectionStart, target.selectionEnd),
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (disabled) return;

    const mod = event.metaKey || event.ctrlKey;
    if (mod && !event.altKey && event.key.toLowerCase() === "b") {
      event.preventDefault();
      run("bold");
      return;
    }
    if (mod && !event.altKey && event.key.toLowerCase() === "i") {
      event.preventDefault();
      run("italic");
      return;
    }
    if (mod && !event.altKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      run("link");
      return;
    }

    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    const textarea = event.currentTarget;
    const result = continueListOnEnter(
      textarea.value,
      textarea.selectionStart,
      textarea.selectionEnd,
    );
    if (!result) return;

    event.preventDefault();
    commit(result.next, result.selectionStart, result.selectionEnd);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-2 py-1.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setTab("write")}
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
            onClick={() => setTab("preview")}
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
              onClick={() => run("bold")}
            >
              <Bold className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Italic"
              size="sm"
              disabled={disabled}
              active={active.italic}
              aria-pressed={active.italic}
              onClick={() => run("italic")}
            >
              <Italic className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Heading"
              size="sm"
              disabled={disabled}
              active={active.heading}
              aria-pressed={active.heading}
              onClick={() => run("heading")}
            >
              <Heading2 className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Bullet list"
              size="sm"
              disabled={disabled}
              active={active.bulletList}
              aria-pressed={active.bulletList}
              onClick={() => run("bulletList")}
            >
              <List className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Numbered list"
              size="sm"
              disabled={disabled}
              active={active.orderedList}
              aria-pressed={active.orderedList}
              onClick={() => run("orderedList")}
            >
              <ListOrdered className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Inline code"
              size="sm"
              disabled={disabled}
              active={active.code}
              aria-pressed={active.code}
              onClick={() => run("code")}
            >
              <Code className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Link"
              size="sm"
              disabled={disabled}
              active={active.link}
              aria-pressed={active.link}
              onClick={() => run("link")}
            >
              <LinkIcon className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
          </div>
        )}
      </div>

      <div className={cn(tab !== "write" && "hidden")}>
        <Textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={onTextChange}
          onSelect={syncActive}
          onKeyUp={syncActive}
          onKeyDown={onKeyDown}
          onClick={syncActive}
          onFocus={syncActive}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          className="rounded-none border-0 focus:border-transparent"
        />
      </div>

      {tab === "preview" && (
        <div className="min-h-28 px-3 py-2">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-muted">Nothing to preview.</p>
          )}
        </div>
      )}

      {!compact && (
        <p className="border-t border-border px-3 py-1.5 text-xs text-muted">
          Markdown supported
        </p>
      )}
    </div>
  );
};

export default MarkdownEditor;
