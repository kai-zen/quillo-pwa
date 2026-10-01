"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useId } from "react";
import { Button, Input, Modal } from "@/components/common";
import { formatDayShort } from "@/components/tasks/helpers";
import { sectionDisplayTitle } from "../helpers";
import SectionTemplateOption from "./SectionTemplateOption";
import { useApplySectionTemplate } from "./useApplySectionTemplate";

interface Props {
  open: boolean;
  date: string;
  onClose: () => void;
}

const ApplySectionTemplateModal: FC<Props> = ({ open, date, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    title="Apply day template"
    className="max-w-2xl"
  >
    {open && <ApplySectionTemplateBody date={date} onClose={onClose} />}
  </Modal>
);

const ApplySectionTemplateBody: FC<Omit<Props, "open">> = ({
  date,
  onClose,
}) => {
  const searchId = useId();
  const router = useRouter();
  const view = useApplySectionTemplate(date, onClose);
  const {
    search,
    setSearch,
    selectedId,
    setSelectedId,
    selectedSectionCount,
    visible,
    previewSections,
    isLoading,
    isError,
    isEmpty,
    isFilterEmpty,
    isTruncated,
    pending,
    error,
    onSubmit,
  } = view;

  const dateLabel = formatDayShort(date);

  const goManage = () => {
    onClose();
    router.push("/day-templates");
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Pick a template to add its sections to {dateLabel}. Existing sections
        stay as they are.
      </p>

      <div className="relative">
        <label htmlFor={searchId} className="sr-only">
          Search templates
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          id={searchId}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or section"
          className="pl-9"
          autoFocus
        />
      </div>

      {isLoading && <p className="text-sm text-muted">Loading templates…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load templates. Try closing and opening this again.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
          <p className="font-medium text-foreground">No templates yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a day template first, then apply it here.
          </p>
          <Button variant="secondary" className="mt-4" onClick={goManage}>
            Manage templates
          </Button>
        </div>
      )}

      {isFilterEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-10 text-center">
          <p className="font-medium text-foreground">No matching templates</p>
          <p className="mt-1 text-sm text-muted">
            Try a different name or section title.
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <ul
          role="listbox"
          aria-label="Day templates"
          className="max-h-[40vh] overflow-y-auto rounded-xl border border-border"
        >
          {visible.map((template) => (
            <SectionTemplateOption
              key={template._id}
              template={template}
              selected={selectedId === template._id}
              disabled={pending}
              onSelect={() => setSelectedId(template._id)}
            />
          ))}
        </ul>
      )}

      {previewSections.length > 0 && (
        <div className="rounded-xl border border-border bg-accent-soft/30 px-4 py-3">
          <p className="text-xs font-medium text-muted">Sections to add</p>
          <ul className="mt-2 flex flex-col gap-1">
            {previewSections.map((section, index) => (
              <li
                key={`${section.sort_order}-${index}`}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <span className="shrink-0 font-medium tabular-nums">
                  {sectionDisplayTitle(section.title)}
                </span>
                <span className="h-px min-w-0 flex-1 bg-border" aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      )}

      {isTruncated && (
        <p className="text-xs text-muted">Showing the first 100 templates.</p>
      )}

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {!isEmpty && (
          <Button
            variant="ghost"
            className="mr-auto"
            onClick={goManage}
            disabled={pending}
          >
            Manage templates
          </Button>
        )}
        <Button variant="ghost" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={pending || !selectedId}>
          {pending
            ? "Applying…"
            : selectedSectionCount === 0
              ? "Apply template"
              : selectedSectionCount === 1
                ? "Apply 1 section"
                : `Apply ${selectedSectionCount} sections`}
        </Button>
      </div>
    </div>
  );
};

export default ApplySectionTemplateModal;
