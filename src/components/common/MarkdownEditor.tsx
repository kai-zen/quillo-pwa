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
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "./cn";
import IconButton from "./IconButton";
import Markdown from "./Markdown";
import Textarea from "./Textarea";

type EditorTab = "write" | "preview";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  id?: string;
  className?: string;
}

type WrapArgs = {
  before: string;
  after?: string;
  multiline?: boolean;
  kind?: FormatKind;
};

type FormatKind =
  | "bold"
  | "italic"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "code"
  | "link";

type ActiveFormats = Record<FormatKind, boolean>;

const EMPTY_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  heading: false,
  bulletList: false,
  orderedList: false,
  code: false,
  link: false,
};

const lineBounds = (value: string, index: number) => {
  const start = value.lastIndexOf("\n", Math.max(0, index - 1)) + 1;
  const nextBreak = value.indexOf("\n", index);
  const end = nextBreak === -1 ? value.length : nextBreak;
  return { start, end, text: value.slice(start, end) };
};

const linesCovering = (value: string, start: number, end: number) => {
  const from = lineBounds(value, start).start;
  const to = lineBounds(value, Math.max(start, end - (end > start ? 1 : 0))).end;
  return value.slice(from, to).split("\n");
};

const isImmediateWrap = (
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
) =>
  start >= before.length &&
  end + after.length <= value.length &&
  value.slice(start - before.length, start) === before &&
  value.slice(end, end + after.length) === after;

const findInlineWrap = (
  value: string,
  start: number,
  end: number,
  marker: string,
): { open: number; close: number } | null => {
  if (isImmediateWrap(value, start, end, marker, marker)) {
    return { open: start - marker.length, close: end };
  }

  const open = value.lastIndexOf(marker, Math.max(0, start - 1));
  if (open === -1) return null;

  const close = value.indexOf(marker, end);
  if (close === -1 || close < end) return null;

  // Avoid matching across newlines for inline marks.
  if (value.slice(open, close).includes("\n")) return null;

  return { open, close };
};

const findLinkWrap = (
  value: string,
  start: number,
  end: number,
): { open: number; close: number; innerStart: number; innerEnd: number } | null => {
  const searchFrom = Math.max(0, start - 200);
  const slice = value.slice(searchFrom, Math.min(value.length, end + 200));
  const pattern = /\[([^\]]*)\]\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(slice))) {
    const open = searchFrom + match.index;
    const close = open + match[0].length;
    const innerStart = open + 1;
    const innerEnd = innerStart + match[1].length;

    if (start >= open && end <= close) {
      return { open, close, innerStart, innerEnd };
    }
  }

  return null;
};

const detectFormats = (
  value: string,
  start: number,
  end: number,
): ActiveFormats => {
  const safeStart = Math.min(start, value.length);
  const safeEnd = Math.min(end, value.length);
  const lines = linesCovering(value, safeStart, safeEnd);

  return {
    bold: !!findInlineWrap(value, safeStart, safeEnd, "**"),
    italic: !!findInlineWrap(value, safeStart, safeEnd, "_"),
    code: !!findInlineWrap(value, safeStart, safeEnd, "`"),
    link: !!findLinkWrap(value, safeStart, safeEnd),
    heading: lines.length > 0 && lines.every((line) => /^\s*#{1,6} /.test(line)),
    bulletList: lines.length > 0 && lines.every((line) => /^\s*- /.test(line)),
    orderedList:
      lines.length > 0 && lines.every((line) => /^\s*\d+\. /.test(line)),
  };
};

const unwrapInline = (
  value: string,
  start: number,
  end: number,
  marker: string,
): { next: string; selectionStart: number; selectionEnd: number } | null => {
  const wrap = findInlineWrap(value, start, end, marker);
  if (!wrap) return null;

  const contentStart = wrap.open + marker.length;
  const contentEnd = wrap.close;
  const content = value.slice(contentStart, contentEnd);
  const next =
    value.slice(0, wrap.open) + content + value.slice(wrap.close + marker.length);

  const offset = start - contentStart;
  const length = Math.max(0, end - start);
  const selectionStart = wrap.open + Math.max(0, Math.min(offset, content.length));
  const selectionEnd = selectionStart + Math.min(length, content.length - (selectionStart - wrap.open));

  return { next, selectionStart, selectionEnd };
};

const unwrapLink = (
  value: string,
  start: number,
  end: number,
): { next: string; selectionStart: number; selectionEnd: number } | null => {
  const wrap = findLinkWrap(value, start, end);
  if (!wrap) return null;

  const label = value.slice(wrap.innerStart, wrap.innerEnd);
  const next = value.slice(0, wrap.open) + label + value.slice(wrap.close);
  return {
    next,
    selectionStart: wrap.open,
    selectionEnd: wrap.open + label.length,
  };
};

const unwrapLinePrefix = (
  value: string,
  start: number,
  end: number,
  pattern: RegExp,
): { next: string; selectionStart: number; selectionEnd: number } => {
  const blockStart = lineBounds(value, start).start;
  const blockEnd = lineBounds(value, Math.max(start, end - (end > start ? 1 : 0))).end;
  const block = value.slice(blockStart, blockEnd);
  const nextBlock = block
    .split("\n")
    .map((line) => line.replace(pattern, ""))
    .join("\n");
  const next = value.slice(0, blockStart) + nextBlock + value.slice(blockEnd);
  const caret = Math.min(start, blockStart + nextBlock.length);
  return { next, selectionStart: caret, selectionEnd: caret };
};

const wrapSelection = (
  textarea: HTMLTextAreaElement,
  value: string,
  { before, after = before, multiline = false }: WrapArgs,
): { next: string; selectionStart: number; selectionEnd: number } => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const hasSelection = start !== end;
  const selected = value.slice(start, end);

  if (multiline) {
    const inserted = hasSelection
      ? selected
          .split("\n")
          .map((line) => `${before}${line}`)
          .join("\n")
      : before;
    const next = `${value.slice(0, start)}${inserted}${value.slice(end)}`;
    const caret = start + inserted.length;
    return { next, selectionStart: caret, selectionEnd: caret };
  }

  if (hasSelection) {
    const inserted = `${before}${selected}${after}`;
    const next = `${value.slice(0, start)}${inserted}${value.slice(end)}`;
    const caret = start + inserted.length;
    return { next, selectionStart: caret, selectionEnd: caret };
  }

  const inserted = `${before}${after}`;
  const next = `${value.slice(0, start)}${inserted}${value.slice(end)}`;
  const caret = start + before.length;
  return { next, selectionStart: caret, selectionEnd: caret };
};

const toggleOrWrap = (
  textarea: HTMLTextAreaElement,
  value: string,
  args: WrapArgs,
  active: ActiveFormats,
): { next: string; selectionStart: number; selectionEnd: number } => {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const kind = args.kind;

  if (kind === "bold" && active.bold) {
    return unwrapInline(value, start, end, "**") ?? wrapSelection(textarea, value, args);
  }
  if (kind === "italic" && active.italic) {
    return unwrapInline(value, start, end, "_") ?? wrapSelection(textarea, value, args);
  }
  if (kind === "code" && active.code) {
    return unwrapInline(value, start, end, "`") ?? wrapSelection(textarea, value, args);
  }
  if (kind === "link" && active.link) {
    return unwrapLink(value, start, end) ?? wrapSelection(textarea, value, args);
  }
  if (kind === "heading" && active.heading) {
    return unwrapLinePrefix(value, start, end, /^\s*#{1,6} /);
  }
  if (kind === "bulletList" && active.bulletList) {
    return unwrapLinePrefix(value, start, end, /^\s*- /);
  }
  if (kind === "orderedList" && active.orderedList) {
    return unwrapLinePrefix(value, start, end, /^\s*\d+\. /);
  }

  return wrapSelection(textarea, value, args);
};

const applyWrap = (
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: (value: string) => void,
  args: WrapArgs,
  active: ActiveFormats,
  pendingSelection: RefObject<{ start: number; end: number } | null>,
) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const { next, selectionStart, selectionEnd } = toggleOrWrap(
    textarea,
    value,
    args,
    active,
  );
  pendingSelection.current = { start: selectionStart, end: selectionEnd };
  onChange(next);
};

const MarkdownEditor: FC<Props> = ({
  value,
  onChange,
  placeholder = "Write markdown…",
  rows = 6,
  disabled,
  id,
  className,
}) => {
  const [tab, setTab] = useState<EditorTab>("write");
  const [active, setActive] = useState<ActiveFormats>(EMPTY_FORMATS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  const syncActive = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setActive(EMPTY_FORMATS);
      return;
    }
    setActive(
      detectFormats(textarea.value, textarea.selectionStart, textarea.selectionEnd),
    );
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
    setActive(detectFormats(textarea.value, pending.start, pending.end));
  }, [value]);

  const run = (args: WrapArgs) => {
    if (disabled) return;
    setTab("write");
    applyWrap(textareaRef, value, onChange, args, active, pendingSelection);
  };

  const onTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
    const target = event.target;
    setActive(
      detectFormats(target.value, target.selectionStart, target.selectionEnd),
    );
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
              onClick={() =>
                run({ before: "**", after: "**", kind: "bold" })
              }
            >
              <Bold className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Italic"
              size="sm"
              disabled={disabled}
              active={active.italic}
              aria-pressed={active.italic}
              onClick={() => run({ before: "_", after: "_", kind: "italic" })}
            >
              <Italic className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Heading"
              size="sm"
              disabled={disabled}
              active={active.heading}
              aria-pressed={active.heading}
              onClick={() =>
                run({
                  before: "## ",
                  after: "",
                  multiline: true,
                  kind: "heading",
                })
              }
            >
              <Heading2 className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Bullet list"
              size="sm"
              disabled={disabled}
              active={active.bulletList}
              aria-pressed={active.bulletList}
              onClick={() =>
                run({
                  before: "- ",
                  after: "",
                  multiline: true,
                  kind: "bulletList",
                })
              }
            >
              <List className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Numbered list"
              size="sm"
              disabled={disabled}
              active={active.orderedList}
              aria-pressed={active.orderedList}
              onClick={() =>
                run({
                  before: "1. ",
                  after: "",
                  multiline: true,
                  kind: "orderedList",
                })
              }
            >
              <ListOrdered className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Inline code"
              size="sm"
              disabled={disabled}
              active={active.code}
              aria-pressed={active.code}
              onClick={() => run({ before: "`", after: "`", kind: "code" })}
            >
              <Code className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
            <IconButton
              label="Link"
              size="sm"
              disabled={disabled}
              active={active.link}
              aria-pressed={active.link}
              onClick={() =>
                run({ before: "[", after: "](url)", kind: "link" })
              }
            >
              <LinkIcon className="h-3.5 w-3.5" aria-hidden />
            </IconButton>
          </div>
        )}
      </div>

      {tab === "write" ? (
        <Textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={onTextChange}
          onSelect={syncActive}
          onKeyUp={syncActive}
          onClick={syncActive}
          onFocus={syncActive}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          className="rounded-none border-0 focus:border-transparent"
        />
      ) : (
        <div className="min-h-28 px-3 py-2">
          {value.trim() ? (
            <Markdown>{value}</Markdown>
          ) : (
            <p className="text-sm text-muted">Nothing to preview.</p>
          )}
        </div>
      )}

      <p className="border-t border-border px-3 py-1.5 text-xs text-muted">
        Markdown supported
      </p>
    </div>
  );
};

export default MarkdownEditor;
