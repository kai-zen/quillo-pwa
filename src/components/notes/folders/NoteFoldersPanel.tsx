"use client";

import { FilePlus2, Folder, Pencil, Trash2 } from "lucide-react";
import { FC, useState } from "react";
import { Button, ConfirmModal, Input } from "@/components/common";
import type { NoteFolder, RecordId } from "@/shared/types";
import { useNoteFoldersPanel } from "./useNoteFoldersPanel";

interface Props {
  folders: NoteFolder[];
  onOpen: (id: RecordId) => void;
}

const NoteFoldersPanel: FC<Props> = ({ folders, onOpen }) => {
  const panel = useNoteFoldersPanel({ onOpen });
  const [toDelete, setToDelete] = useState<NoteFolder | null>(null);

  const confirmDelete = () => {
    if (!toDelete || panel.pending) return;
    const folder = toDelete;
    setToDelete(null);
    void panel.onDelete(folder);
  };

  return (
    <section>
      <nav
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        aria-label="Note folders"
      >
        {folders.map((folder) => {
          const renaming = panel.isRenaming(folder._id);

          if (renaming) {
            return (
              <form
                key={folder._id}
                onSubmit={panel.onSubmit}
                className="flex min-h-28 flex-col justify-between gap-2 rounded-xl border border-accent bg-accent-soft p-3"
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
              className="flex min-h-28 flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/50 hover:bg-background"
            >
              <button
                type="button"
                onClick={() => onOpen(folder._id)}
                className="flex min-h-0 flex-1 cursor-pointer flex-col items-start justify-between gap-3 p-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <Folder
                  className="h-6 w-6 shrink-0 text-foreground"
                  aria-hidden
                />
                <span className="block w-full truncate font-medium text-foreground">
                  {folder.name}
                </span>
              </button>
              <div className="flex items-center border-t border-border">
                <button
                  type="button"
                  onClick={() => panel.startRename(folder)}
                  disabled={panel.pending}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-muted transition-colors hover:bg-accent-soft hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  Rename
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(folder)}
                  disabled={panel.pending}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-l border-border px-2 py-2 text-xs font-medium text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {panel.creating && (
          <form
            onSubmit={panel.onSubmit}
            className="flex min-h-28 flex-col justify-between gap-2 rounded-xl border border-dashed border-accent bg-accent-soft p-3"
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

      {panel.error && <p className="text-sm text-rose-500">{panel.error}</p>}

      <ConfirmModal
        open={!!toDelete}
        title="Delete folder"
        description={
          toDelete
            ? `Delete “${toDelete.name}”? Notes stay, but leave this folder.`
            : undefined
        }
        confirmLabel="Delete"
        pending={panel.pending}
        pendingLabel="Deleting…"
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};

export default NoteFoldersPanel;
