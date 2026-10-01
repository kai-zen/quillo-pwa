"use client";

import { LayoutTemplate, Plus } from "lucide-react";
import { FC } from "react";
import {
  Button,
  Modal,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common";
import type { SectionTemplate } from "@/shared/types";
import { formatSectionCount, sectionsFromTemplate } from "./helpers";
import SectionTemplateForm, {
  sectionTemplateFormTitle,
} from "./form/SectionTemplateForm";
import type { SectionTemplatesListViewModel } from "./hooks/useSectionTemplatesListView";

interface Props {
  view: SectionTemplatesListViewModel;
}

const SectionTemplatesList: FC<Props> = ({ view }) => {
  const {
    page,
    setPage,
    templateFormMode,
    templates,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateTemplate,
    openEditTemplate,
    closeTemplateForm,
    onTemplateSaved,
  } = view;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title="Day templates"
        description="Save reusable day structures, then apply them from Tasks."
        icon={LayoutTemplate}
        actions={
          <Button onClick={openCreateTemplate} size="sm">
            <Plus className="h-4 w-4" aria-hidden />
            New template
          </Button>
        }
      />

      <Modal
        open={!!templateFormMode}
        onClose={closeTemplateForm}
        title={templateFormMode ? sectionTemplateFormTitle(templateFormMode) : ""}
        className="max-w-2xl"
      >
        {templateFormMode && (
          <SectionTemplateForm
            key={
              templateFormMode.type === "edit"
                ? templateFormMode.template._id
                : "create"
            }
            mode={templateFormMode}
            onClose={closeTemplateForm}
            onSaved={onTemplateSaved}
          />
        )}
      </Modal>

      {isLoading && <p className="text-sm text-muted">Loading templates…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load templates. Try refreshing the page.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">No day templates yet</p>
          <p className="mt-1 text-sm text-muted">
            Create a work day, university day, or any structure you reuse often.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={openCreateTemplate}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New template
          </Button>
        </div>
      )}

      {!isLoading && !isError && templates.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-28">Sections</TableHead>
              <TableHead>Sections preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template: SectionTemplate) => {
              const sections = sectionsFromTemplate(template.sections);
              const preview = sections
                .slice(0, 5)
                .map((section) => section.title.trim() || "Untitled")
                .join(" · ");

              return (
                <TableRow
                  key={template._id}
                  onClick={() => openEditTemplate(template)}
                  aria-label={`Edit template ${template.name}`}
                >
                  <TableCell>
                    <span className="block truncate font-medium text-foreground">
                      {template.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums text-muted">
                      {formatSectionCount(sections.length)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block truncate text-sm text-muted">
                      {preview || "—"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isFetching}
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
            disabled={page >= totalPages || isFetching}
          >
            Next
          </Button>
        </div>
      )}

      {!isLoading && !isError && templates.length > 0 && (
        <p className="text-xs font-medium tabular-nums text-muted">
          {total} template{total === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
};

export default SectionTemplatesList;
