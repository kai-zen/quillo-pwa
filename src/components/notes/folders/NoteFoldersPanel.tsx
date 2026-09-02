"use client";

import { FolderPlus, Pencil, Trash2 } from "lucide-react";
import { FC } from "react";
import {
  Button,
  IconButton,
  Input,
  cn,
} from "@/components/common";
import type { NoteFolder } from "@/shared/types";
import {
  ALL_NOTES,
  UNFILED_NOTES,
  type FolderFilter,
} from "../helpers";
import { useNoteFoldersPanel } from "./useNoteFoldersPanel";

interface Props {
  folders: NoteFolder[];
  selected: FolderFilter;
  onSelect: (filter: FolderFilter) => void;
}

const FolderButton: FC<{
  selected: boolean;
  onClick: () => void;
  children: string;
}> = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={selected ? "true" : undefined}
    className={cn(
      "flex min-w-0 flex-1 cursor-pointer items-center rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
      selected
        ? "bg-accent-soft font-medium text-foreground"
        : "text-muted hover:bg-background hover:text-foreground",
    )}
  >
    <span className="truncate">{children}</span>
  </button>
);

const NoteFoldersPanel: FC<Props> = ({ folders, selected, onSelect }) => {
  const panel = useNoteFoldersPanel(selected, onSelect);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-2 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2 lg:w-56">
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-sm font-medium text-foreground">Folders</h2>
        <IconButton
          label="New folder"
          size="sm"
          onClick={panel.startCreate}
          disabled={panel.pending}
        >
          <FolderPlus className="h-4 w-4" aria-hidden />
        </IconButton>
      </div>

      <nav className="flex flex-col gap-0.5" aria-label="Note folders">
        <FolderButton
          selected={selected === ALL_NOTES}
          onClick={() => onSelect(ALL_NOTES)}
        >
          All notes
        </FolderButton>
        <FolderButton
          selected={selected === UNFILED_NOTES}
          onClick={() => onSelect(UNFILED_NOTES)}
        >
          Unfiled
        </FolderButton>

        {folders.map((folder) => {
          const active = selected === folder._id;
          const renaming = panel.isRenaming(folder._id);

          if (renaming) {
            return (
              <form
                key={folder._id}
                onSubmit={panel.onSubmit}
                className="flex flex-col gap-1.5 rounded-md bg-accent-soft p-1.5"
              >
                <Input
                  value={panel.name}
                  onChange={(event) => panel.setName(event.target.value)}
                  maxLength={200}
                  required
                  autoFocus
                  aria-label="Folder name"
                  className="px-2 py-1.5"
                />
                <div className="flex justify-end gap-1">
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
              </form>
            );
          }

          return (
            <div
              key={folder._id}
              className={cn(
                "flex items-center gap-0.5 rounded-md",
                active && "bg-accent-soft",
              )}
            >
              <FolderButton
                selected={active}
                onClick={() => onSelect(folder._id)}
              >
                {folder.name}
              </FolderButton>
              {active && (
                <>
                  <IconButton
                    label={`Rename ${folder.name}`}
                    size="sm"
                    onClick={() => panel.startRename(folder)}
                    disabled={panel.pending}
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                  <IconButton
                    label={`Delete ${folder.name}`}
                    size="sm"
                    onClick={() => panel.onDelete(folder)}
                    disabled={panel.pending}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </IconButton>
                </>
              )}
            </div>
          );
        })}
      </nav>

      {panel.creating && (
        <form
          onSubmit={panel.onSubmit}
          className="flex flex-col gap-1.5 rounded-md border border-border p-1.5"
        >
          <Input
            value={panel.name}
            onChange={(event) => panel.setName(event.target.value)}
            placeholder="Folder name"
            maxLength={200}
            required
            autoFocus
            aria-label="New folder name"
            className="px-2 py-1.5"
          />
          <div className="flex justify-end gap-1">
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
              Create
            </Button>
          </div>
        </form>
      )}

      {panel.error && (
        <p className="px-1 text-sm text-rose-500">{panel.error}</p>
      )}
    </aside>
  );
};

export default NoteFoldersPanel;
