"use client";

import { Pencil, Pin, X } from "lucide-react";
import { FC, useId } from "react";
import {
  Button,
  IconButton,
  Input,
  MarkdownEditor,
  Modal,
} from "@/components/common";
import { LabelField, LabelManagerModal } from "@/components/labels";
import { formatNoteDate } from "../helpers";
import NoteReader from "../NoteReader";
import { useNoteModal } from "./useNoteModal";
import {
  useNoteForm,
  type NoteFormMode,
  type NoteModalMode,
  type NoteSaveResult,
} from "./useNoteForm";

export type {
  NoteCreateContext,
  NoteFormMode,
  NoteModalMode,
  NoteSaveResult,
} from "./useNoteForm";

interface Props {
  mode: NoteFormMode;
  onClose: () => void;
  onSaved: (result?: NoteSaveResult) => void;
}

const Chip: FC<{
  label: string;
  onRemove: () => void;
  removeLabel: string;
}> = ({ label, onRemove, removeLabel }) => (
  <span className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-foreground">
    {label}
    <button
      type="button"
      aria-label={removeLabel}
      onClick={onRemove}
      className="cursor-pointer text-muted hover:text-foreground"
    >
      <X className="h-3 w-3" aria-hidden />
    </button>
  </span>
);

const NoteForm: FC<Props> = ({ mode, onClose, onSaved }) => {
  const titleId = useId();
  const form = useNoteForm(mode, onSaved);

  return (
    <>
      <form onSubmit={form.onSubmit} className="flex w-full flex-col gap-3">
        {(form.date || form.goalId || form.sprintId) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {form.date && (
              <Chip
                label={formatNoteDate(form.date)}
                onRemove={form.clearDate}
                removeLabel="Remove date"
              />
            )}
            {form.goalId && (
              <Chip
                label={form.goalTitle || "Goal"}
                onRemove={form.clearGoal}
                removeLabel="Remove goal"
              />
            )}
            {form.sprintId && (
              <Chip
                label={form.sprintName || "Sprint"}
                onRemove={form.clearSprint}
                removeLabel="Remove sprint"
              />
            )}
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <label htmlFor={titleId} className="text-sm text-muted">
              Title
            </label>
            <div className="flex items-center">
              <IconButton
                label={form.pinned ? "Unpin note" : "Pin note"}
                size="sm"
                active={form.pinned}
                onClick={() => form.setPinned(!form.pinned)}
                disabled={form.pending}
              >
                <Pin
                  className={form.pinned ? "h-4 w-4 fill-current" : "h-4 w-4"}
                  aria-hidden
                />
              </IconButton>
            </div>
          </div>
          <Input
            id={titleId}
            value={form.title}
            onChange={(event) => form.setTitle(event.target.value)}
            required
            maxLength={200}
            autoFocus
            placeholder="Note title"
          />
        </div>

        <MarkdownEditor
          value={form.content}
          onChange={form.setContent}
          rows={14}
          maxRows={28}
          placeholder="Start writing…"
        />

        <LabelField
          labels={form.labels}
          selectedIds={form.labelIds}
          onChange={form.setLabelIds}
          onCreate={form.openLabelCreate}
        />

        {form.error && <p className="text-sm text-rose-500">{form.error}</p>}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {form.editing && (
            <Button
              variant="ghost"
              className="mr-auto hover:text-rose-500"
              onClick={form.onDelete}
              disabled={form.pending}
            >
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} disabled={form.pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.pending}>
            {form.pending ? "Saving…" : form.editing ? "Save" : "Save note"}
          </Button>
        </div>
      </form>

      <LabelManagerModal
        open={form.labelManagerOpen}
        labels={form.labels}
        initialName={form.labelDraftName}
        onClose={form.closeLabelManager}
        onCreated={(label) => form.onLabelCreated(label._id)}
        onDeleted={form.onLabelDeleted}
      />
    </>
  );
};

export default NoteForm;

export const noteFormTitle = (mode: NoteFormMode): string =>
  mode.type === "edit" ? "Edit note" : "New note";

interface NoteEditorModalProps {
  mode: NoteModalMode | null;
  onClose: () => void;
  onSaved: (result?: NoteSaveResult) => void;
}

export const NoteEditorModal: FC<NoteEditorModalProps> = ({
  mode,
  onClose,
  onSaved,
}) => {
  const modal = useNoteModal(mode, onClose, onSaved);

  return (
    <Modal
      open={!!mode}
      onClose={onClose}
      title={
        <span className="block truncate" title={modal.title}>
          {modal.title}
        </span>
      }
      headerActions={
        modal.reading ? (
          <IconButton label="Edit note" size="sm" onClick={modal.startEdit}>
            <Pencil className="h-4 w-4" aria-hidden />
          </IconButton>
        ) : null
      }
      className="max-w-3xl sm:max-h-[90vh]"
    >
      {modal.formMode && (
        <NoteForm
          key={
            modal.formMode.type === "edit"
              ? modal.formMode.note._id
              : "create"
          }
          mode={modal.formMode}
          onClose={modal.onFormClose}
          onSaved={modal.onFormSaved}
        />
      )}
      {modal.reading && modal.note && <NoteReader note={modal.note} />}
    </Modal>
  );
};
