"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  RefObject,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  continueListOnEnter,
  detectFormats,
  EMPTY_FORMATS,
  type ActiveFormats,
  type FormatKind,
  toggleOrWrap,
} from "./markdownEditorFormat";

export type EditorTab = "write" | "preview";

interface Args {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface Result {
  tab: EditorTab;
  setTab: (tab: EditorTab) => void;
  active: ActiveFormats;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  run: (kind: FormatKind) => void;
  syncActive: () => void;
  onTextChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function useMarkdownEditor({
  value,
  onChange,
  disabled,
}: Args): Result {
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

  return {
    tab,
    setTab,
    active,
    textareaRef,
    run,
    syncActive,
    onTextChange,
    onKeyDown,
  };
}
