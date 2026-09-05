"use client";

import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { FC } from "react";
import { Button, Input } from "@/components/common";
import type { NoteFolder } from "@/shared/types";
import { useNoteFoldersPanel } from "./useNoteFoldersPanel";

interface Props {
  folder: NoteFolder;
  noteCount: number;
  onBack: () => void;
  onDeleted: () => void;
}

const OpenFolderBar: FC<Props> = ({
  folder,
  noteCount,
  onBack,
  onDeleted,
}) => {
  const panel = useNoteFoldersPanel({ onDeleted: () => onDeleted() });
  const renaming = panel.isRenaming(folder._id);

  if (renaming) {
    return (
      <form
        onSubmit={panel.onSubmit}
        className="flex flex-wrap items-center gap-2 rounded-xl border border-accent bg-accent-soft p-2.5 shadow-sm shadow-black/2"
      >
        <Input
          value={panel.name}
          onChange={(event) => panel.setName(event.target.value)}
          maxLength={200}
          required
          autoFocus
          aria-label="Folder name"
          className="min-w-0 flex-1 px-2 py-1.5 text-sm sm:max-w-xs"
        />
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={panel.cancelEditor}
            disabled={panel.pending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={panel.pending || !panel.name.trim()}
          >
            Save
          </Button>
        </div>
        {panel.error && (
          <p className="w-full text-sm text-rose-500">{panel.error}</p>
        )}
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Notes
      </Button>
      <span className="min-w-0 truncate text-sm font-medium text-foreground sm:ml-1">
        {folder.name}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => panel.startRename(folder)}
          disabled={panel.pending}
          aria-label={`Rename ${folder.name}`}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Rename</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => panel.onDelete(folder)}
          disabled={panel.pending}
          aria-label={`Delete ${folder.name}`}
          className="hover:text-rose-600"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </div>
      <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
        {noteCount} note{noteCount === 1 ? "" : "s"}
      </span>
      {panel.error && (
        <p className="w-full text-sm text-rose-500">{panel.error}</p>
      )}
    </div>
  );
};

export default OpenFolderBar;
