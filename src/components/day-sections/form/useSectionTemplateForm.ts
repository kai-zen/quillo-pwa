"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/shared/errors";
import { useSectionTemplatesApi } from "@/shared/hooks";
import type {
  CreateSectionTemplateBody,
  SectionTemplate,
  UpdateSectionTemplateBody,
} from "@/shared/types";

export type SectionTemplateFormMode =
  | { type: "create" }
  | { type: "edit"; template: SectionTemplate };

export interface SectionFormItem {
  key: string;
  title: string;
}

const newSection = (): SectionFormItem => ({
  key: crypto.randomUUID(),
  title: "",
});

const isBlankSection = (section: SectionFormItem) => !section.title.trim();

const sectionsFromTemplate = (template: SectionTemplate): SectionFormItem[] => {
  if (template.sections.length === 0) return [newSection()];
  return [...template.sections]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((section) => ({
      key: crypto.randomUUID(),
      title: section.title,
    }));
};

export function useSectionTemplateForm(
  mode: SectionTemplateFormMode,
  onSaved: (result?: { deleted?: boolean }) => void,
) {
  const {
    createSectionTemplate,
    updateSectionTemplate,
    deleteSectionTemplate,
    isCreating,
    isUpdating,
    isDeleting,
  } = useSectionTemplatesApi();

  const editing = mode.type === "edit" ? mode.template : null;

  const [name, setName] = useState(editing?.name ?? "");
  const [sections, setSections] = useState<SectionFormItem[]>(() =>
    editing ? sectionsFromTemplate(editing) : [newSection()],
  );
  const [error, setError] = useState("");

  const pending = isCreating || isUpdating || isDeleting;

  const addSection = () => {
    const last = sections[sections.length - 1];
    if (last && isBlankSection(last)) return last.key;
    const section = newSection();
    setSections((current) => [...current, section]);
    return section.key;
  };

  const removeSection = (key: string) => {
    setSections((current) => current.filter((section) => section.key !== key));
  };

  const updateSection = (key: string, title: string) => {
    setSections((current) =>
      current.map((section) =>
        section.key === key ? { ...section, title } : section,
      ),
    );
  };

  const buildSectionsBody = () =>
    sections
      .map((section, index) => ({
        title: section.title.trim(),
        sort_order: index,
      }))
      .filter((section) => section.title.length > 0);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    const sectionsBody = buildSectionsBody();
    setError("");

    try {
      if (editing) {
        const body: UpdateSectionTemplateBody = {
          name: trimmedName,
          sections: sectionsBody,
        };
        await updateSectionTemplate(editing._id, body);
      } else {
        const body: CreateSectionTemplateBody = {
          name: trimmedName,
          sections: sectionsBody,
        };
        await createSectionTemplate(body);
      }
      onSaved();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          editing ? "Could not update template." : "Could not create template.",
        ),
      );
    }
  };

  const onDelete = async () => {
    if (!editing || pending) return;
    setError("");

    try {
      await deleteSectionTemplate(editing._id);
      onSaved({ deleted: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete template."));
    }
  };

  return {
    editing,
    name,
    setName,
    sections,
    pending,
    error,
    addSection,
    removeSection,
    updateSection,
    onSubmit,
    onDelete,
  };
}
