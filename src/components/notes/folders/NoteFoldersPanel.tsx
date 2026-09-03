"use client";

import { FilePlus2, Folder, Pencil, Trash2 } from "lucide-react";
import { FC } from "react";
import { Button, IconButton, Input } from "@/components/common";
import type { NoteFolder, RecordId } from "@/shared/types";
import { useNoteFoldersPanel } from "./useNoteFoldersPanel";

interface Props {
  folders: NoteFolder[];
  onOpen: (id: RecordId) => void;
}

const NoteFoldersPanel: FC<Props> = ({ folders, onOpen }) => {
  const panel = useNoteFoldersPanel(onOpen);

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
              className="group relative flex min-h-28 overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-background hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => onOpen(folder._id)}
                className="flex flex-1 cursor-pointer flex-col items-start justify-between p-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <Folder
                  className="h-6 w-6 transition-transform group-hover:scale-110"
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
