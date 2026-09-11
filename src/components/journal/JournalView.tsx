"use client";

import { BookHeart } from "lucide-react";
import { FC } from "react";
import { Button, PageHeader } from "@/components/common";
import { groupEntriesByMonth } from "./helpers";
import JournalEntryCard from "./JournalEntryCard";
import JournalReader from "./JournalReader";
import { useJournalView } from "./useJournalView";

const JournalView: FC = () => {
  const {
    entries,
    total,
    page,
    setPage,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    readingDate,
    openEntry,
    closeEntry,
  } = useJournalView();

  const groups = groupEntriesByMonth(entries);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader
        title="Journal"
        description="A quiet place to look back on how your days felt."
        icon={BookHeart}
        eyebrow={
          total > 0 ? (
            <span className="text-xs font-medium text-muted">
              {total} {total === 1 ? "reflection" : "reflections"} written
            </span>
          ) : undefined
        }
      />

      {isLoading && <p className="text-sm text-muted">Loading journal…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load your journal. Try refreshing the page.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <BookHeart className="mx-auto h-8 w-8 text-muted" aria-hidden />
          <p className="mt-3 font-medium text-foreground">
            No reflections yet
          </p>
          <p className="mt-1 text-sm text-muted">
            End a day from the home page and it will show up here.
          </p>
        </div>
      )}

      {!isLoading && !isError && groups.length > 0 && (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2.5">
              <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted/70">
                {group.label}
              </p>
              <div className="flex flex-col gap-2.5">
                {group.items.map((entry) => (
                  <JournalEntryCard
                    key={entry._id}
                    entry={entry}
                    onOpen={() => openEntry(entry)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || isFetching}
          >
            Newer
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
            Older
          </Button>
        </div>
      )}

      <JournalReader date={readingDate} onClose={closeEntry} />
    </div>
  );
};

export default JournalView;
