"use client";

import { Pencil, Trash2 } from "lucide-react";
import { FC, FormEvent, useMemo, useState } from "react";
import {
  Button,
  ConfirmModal,
  Field,
  IconButton,
  Input,
  Modal,
  cn,
} from "@/components/common";
import { getErrorMessage } from "@/shared/errors";
import { useLabelsApi } from "@/shared/hooks";
import type { Label, RecordId } from "@/shared/types";
import { LABEL_COLORS } from "./colors";

interface Props {
  open: boolean;
  labels: Label[];
  initialName?: string;
  onClose: () => void;
  onCreated?: (label: Label) => void;
  onDeleted?: (id: RecordId) => void;
}

type Editor =
  | { type: "create" }
  | { type: "edit"; label: Label };

const ColorPicker: FC<{
  value: string;
  onChange: (color: string) => void;
}> = ({ value, onChange }) => {
  const colors = useMemo(() => {
    if (LABEL_COLORS.includes(value as (typeof LABEL_COLORS)[number])) {
      return LABEL_COLORS;
    }
    return [value, ...LABEL_COLORS];
  }, [value]);

  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "h-7 w-7 cursor-pointer rounded-md border transition-opacity",
            value === color
              ? "border-foreground opacity-100"
              : "border-transparent opacity-70 hover:opacity-100",
          )}
          style={{ backgroundColor: color }}
          aria-label={`Color ${color}`}
          aria-pressed={value === color}
        />
      ))}
    </div>
  );
};

const LabelManagerModal: FC<Props> = ({ open, onClose, ...bodyProps }) => (
  <Modal open={open} onClose={onClose} title="Manage labels">
    <LabelManagerBody key={bodyProps.initialName ?? ""} {...bodyProps} />
  </Modal>
);

const LabelManagerBody: FC<Omit<Props, "open" | "onClose">> = ({
  labels,
  initialName = "",
  onCreated,
  onDeleted,
}) => {
  const {
    createLabel,
    updateLabel,
    deleteLabel,
    isCreating,
    isUpdating,
    isDeleting,
  } = useLabelsApi();

  const [editor, setEditor] = useState<Editor>({ type: "create" });
  const [name, setName] = useState(initialName.trim());
  const [color, setColor] = useState<string>(LABEL_COLORS[0]);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<Label | null>(null);

  const pending = isCreating || isUpdating || isDeleting;
  const editing = editor.type === "edit";

  const startCreate = () => {
    setEditor({ type: "create" });
    setName("");
    setColor(LABEL_COLORS[0]);
    setError("");
  };

  const startEdit = (label: Label) => {
    setEditor({ type: "edit", label });
    setName(label.name);
    setColor(label.color);
    setError("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setError("");
    try {
      if (editor.type === "edit") {
        await updateLabel(editor.label._id, { name: trimmed, color });
        startCreate();
        return;
      }

      const label = await createLabel({ name: trimmed, color });
      onCreated?.(label);
      startCreate();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing ? "Could not update label." : "Could not create label.",
        ),
      );
    }
  };

  const onDelete = async (label: Label) => {
    setError("");
    try {
      await deleteLabel(label._id);
      onDeleted?.(label._id);
      if (editor.type === "edit" && editor.label._id === label._id) {
        startCreate();
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete label."));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {labels.length === 0 ? (
        <p className="text-sm text-muted">No labels yet. Create one below.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {labels.map((label) => {
            const selected =
              editor.type === "edit" && editor.label._id === label._id;

            return (
              <li
                key={label._id}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5",
                  selected && "bg-accent-soft",
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: label.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                  {label.name}
                </span>
                <IconButton
                  label={`Edit ${label.name}`}
                  size="sm"
                  onClick={() => startEdit(label)}
                  disabled={pending}
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                </IconButton>
                <IconButton
                  label={`Delete ${label.name}`}
                  size="sm"
                  onClick={() => setToDelete(label)}
                  disabled={pending}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-lg border border-border p-3"
      >
        <p className="text-sm font-medium text-foreground">
          {editing ? "Edit label" : "New label"}
        </p>
        <Field label="Name">
          <Input
            key={editor.type === "edit" ? editor.label._id : "create"}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Bug, frontend, later…"
            maxLength={50}
            required
            autoFocus
          />
        </Field>
        <div>
          <span className="mb-1.5 block text-sm text-muted">Color</span>
          <ColorPicker value={color} onChange={setColor} />
        </div>
        {error && <p className="text-sm text-foreground">{error}</p>}
        <div className="flex justify-end gap-2">
          {editing && (
            <Button variant="ghost" onClick={startCreate} disabled={pending}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={pending || !name.trim()}>
            {pending
              ? "Saving…"
              : editing
                ? "Save label"
                : "Create label"}
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={!!toDelete}
        title="Delete label"
        description={
          toDelete ? `Delete “${toDelete.name}”?` : undefined
        }
        confirmLabel="Delete"
        pending={pending}
        pendingLabel="Deleting…"
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          const label = toDelete;
          setToDelete(null);
          void onDelete(label);
        }}
      />
    </div>
  );
};

export default LabelManagerModal;
