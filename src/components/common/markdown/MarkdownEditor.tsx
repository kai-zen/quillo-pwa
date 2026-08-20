"use client";

import { FC } from "react";
import { cn } from "../cn";
import Textarea from "../Textarea";
import Markdown from "./Markdown";
import MarkdownEditorToolbar from "./MarkdownEditorToolbar";
import { useMarkdownEditor } from "./useMarkdownEditor";

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
  const {
    tab,
    setTab,
    active,
    textareaRef,
    run,
    syncActive,
    onTextChange,
    onKeyDown,
  } = useMarkdownEditor({ value, onChange, disabled });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface",
        className,
      )}
    >
      <MarkdownEditorToolbar
        tab={tab}
        onTabChange={setTab}
        active={active}
        disabled={disabled}
        onFormat={run}
      />

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
    </div>
  );
};

export default MarkdownEditor;
