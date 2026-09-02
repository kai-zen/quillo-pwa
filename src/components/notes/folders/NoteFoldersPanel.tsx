"use client";

import { FilePlus2, Folder, FolderOpen, Pencil, Trash2 } from "lucide-react";
import { FC } from "react";
import { Button, IconButton, Input, cn } from "@/components/common";
import type { NoteFolder } from "@/shared/types";
import { ALL_NOTES, UNFILED_NOTES, type FolderFilter } from "../helpers";
import { useNoteFoldersPanel } from "./useNoteFoldersPanel";

interface Props {
  folders: NoteFolder[];
  selected: FolderFilter;
  onSelect: (filter: FolderFilter) => void;
}

const SystemFolderCard: FC<{
  icon: typeof Folder;
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}> = ({ icon: Icon, selected, onClick, title, description }) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={selected ? "true" : undefined}
    className={cn(
      "group flex min-h-28 cursor-pointer flex-col items-start justify-between rounded-xl border p-3.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
      selected
        ? "border-accent bg-accent-soft text-foreground shadow-sm"
        : "border-border bg-surface text-muted hover:-translate-y-0.5 hover:border-accent/50 hover:bg-background hover:text-foreground hover:shadow-sm",
    )}
  >
    <Icon
      className={cn(
        "h-6 w-6 transition-transform",
        selected && "fill-current",
        !selected && "group-hover:scale-110",
      )}
      aria-hidden
    />
    <span>
      <span className="block font-medium">{title}</span>
      <span className="mt-0.5 block text-xs font-normal text-muted">
        {description}
      </span>
    </span>
  </button>
);

const NoteFoldersPanel: FC<Props> = ({ folders, selected, onSelect }) => {
  const panel = useNoteFoldersPanel(selected, onSelect);

  return (
    <section aria-labelledby="folders-heading">
      <nav
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        aria-label="Note folders"
      >
        <SystemFolderCard
          icon={FolderOpen}
          selected={selected === ALL_NOTES}
          onClick={() => onSelect(ALL_NOTES)}
          title="All notes"
          description="Everything you’ve written"
        />
        <SystemFolderCard
          icon={Folder}
          selected={selected === UNFILED_NOTES}
          onClick={() => onSelect(UNFILED_NOTES)}
          title="Unfiled"
          description="Notes to organize"
        />

        {folders.map((folder) => {
          const active = selected === folder._id;
          const renaming = panel.isRenaming(folder._id);

          if (renaming) {
            return (
              <form
                key={folder._id}
                onSubmit={panel.onSubmit}
                className="flex min-h-28 flex-col justify-between rounded-xl border border-accent bg-accent-soft p-3"
              >
                <Input
                  value={panel.name}
                  onChange={(event) => panel.setName(event.target.value)}
                  maxLength={200}
                  required
                  autoFocus
                  aria-label="Folder name"
                  className="px-2 py-1.5 text-sm"
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
                "group relative flex min-h-28 overflow-hidden rounded-xl border transition-all",
                active
                  ? "border-accent bg-accent-soft shadow-sm"
                  : "border-border bg-surface hover:-translate-y-0.5 hover:border-accent/50 hover:bg-background hover:shadow-sm",
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(folder._id)}
                aria-current={active ? "true" : undefined}
                className="flex flex-1 cursor-pointer flex-col items-start justify-between p-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <Folder
                  className={cn(
                    "h-6 w-6 transition-transform",
                    active && "fill-current",
                    !active && "group-hover:scale-110",
                  )}
                  aria-hidden
                />
                <span className="block w-full truncate font-medium text-foreground">
                  {folder.name}
                </span>
              </button>
              <div className="absolute right-1.5 top-1.5 flex gap-0.5 rounded-md bg-surface/90 p-0.5 opacity-0 shadow-sm transition-opacity focus-within:opacity-100 group-hover:opacity-100">
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
              </div>
            </div>
          );
        })}

        {panel.creating && (
          <form
            onSubmit={panel.onSubmit}
            className="flex min-h-28 flex-col justify-between rounded-xl border border-dashed border-accent bg-accent-soft p-3"
          >
            <Input
              value={panel.name}
              onChange={(event) => panel.setName(event.target.value)}
              placeholder="Folder name"
              maxLength={200}
              required
              autoFocus
              aria-label="New folder name"
              className="px-2 py-1.5 text-sm"
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

        {!panel.creating && (
          <button
            type="button"
            onClick={panel.startCreate}
            disabled={panel.pending}
            className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface p-3 text-sm font-medium text-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <FilePlus2 className="h-5 w-5" aria-hidden />
            New folder
          </button>
        )}
      </nav>

      {panel.error && (
        <p className="mt-2 text-sm text-rose-500">{panel.error}</p>
      )}
    </section>
  );
};

export default NoteFoldersPanel;
