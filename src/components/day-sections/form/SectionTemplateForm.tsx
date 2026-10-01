"use client";

import { FC, useId, useState } from "react";
import {
  Button,
  ConfirmModal,
  Field,
  Input,
} from "@/components/common";
import TemplateSectionsEditor from "./TemplateSectionsEditor";
import {
  useSectionTemplateForm,
  type SectionTemplateFormMode,
} from "./useSectionTemplateForm";

export type { SectionTemplateFormMode };

interface Props {
  mode: SectionTemplateFormMode;
  onClose: () => void;
  onSaved: (result?: { deleted?: boolean }) => void;
}

export const sectionTemplateFormTitle = (mode: SectionTemplateFormMode) =>
  mode.type === "edit" ? "Edit day template" : "New day template";

const SectionTemplateForm: FC<Props> = ({ mode, onClose, onSaved }) => {
  const nameId = useId();
  const form = useSectionTemplateForm(mode, onSaved);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <form onSubmit={form.onSubmit} className="flex w-full flex-col gap-3">
        <p className="text-sm text-muted">
          {form.editing
            ? "Update this reusable day structure."
            : "Save a preset you can apply to any day."}
        </p>

        <Field label="Name" htmlFor={nameId}>
          <Input
            id={nameId}
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
            required
            maxLength={120}
            autoFocus
            placeholder="Work day, university, vacation…"
          />
        </Field>

        <TemplateSectionsEditor
          sections={form.sections}
          disabled={form.pending}
          onAdd={form.addSection}
          onRemove={form.removeSection}
          onUpdate={form.updateSection}
        />

        {form.error && <p className="text-sm text-foreground">{form.error}</p>}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          {form.editing && (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto text-rose-600 hover:text-rose-700 dark:text-rose-400"
              onClick={() => setConfirmDelete(true)}
              disabled={form.pending}
            >
              Delete template
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={form.pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.pending}>
            {form.pending
              ? form.editing
                ? "Saving…"
                : "Creating…"
              : form.editing
                ? "Save changes"
                : "Create template"}
          </Button>
        </div>
      </form>

      <ConfirmModal
        open={confirmDelete}
        title="Delete day template"
        description={
          form.editing
            ? `Delete “${form.editing.name}”? Days that already used it keep their sections.`
            : undefined
        }
        confirmLabel="Delete"
        pending={form.pending}
        pendingLabel="Deleting…"
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          void form.onDelete();
        }}
      />
    </>
  );
};

export default SectionTemplateForm;
