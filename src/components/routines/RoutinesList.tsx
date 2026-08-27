"use client";

import { ListFilter, Plus, Repeat } from "lucide-react";
import { FC } from "react";
import {
  Button,
  Modal,
  PageHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common";
import type { DayOfWeek, Routine } from "@/shared/types";
import { DAYS_OF_WEEK } from "@/shared/types";
import RoutineForm, { routineFormTitle } from "./form/RoutineForm";
import { DAY_LABELS, formatSchedule } from "./helpers";
import type { RoutinesListViewModel } from "./hooks/useRoutinesListView";

interface Props {
  view: RoutinesListViewModel;
}

const RoutinesList: FC<Props> = ({ view }) => {
  const {
    dayFilter,
    setDayFilterAndResetPage,
    page,
    setPage,
    routineFormMode,
    routines,
    labels,
    total,
    totalPages,
    isLoading,
    isError,
    isEmpty,
    isFetching,
    openCreateRoutine,
    openEditRoutine,
    closeRoutineForm,
    onRoutineSaved,
  } = view;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <PageHeader
        title="Routines"
        description="Save repeating drafts, then drop them onto a day as tasks."
        icon={Repeat}
        actions={
          <Button onClick={openCreateRoutine} className="shadow-sm">
            <Plus className="h-4 w-4" aria-hidden />
            New routine
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-2.5 shadow-sm shadow-black/2">
        <span className="inline-flex items-center gap-2 pl-1 text-sm font-medium text-foreground">
          <ListFilter className="h-4 w-4 text-muted" aria-hidden />
          Filter
        </span>
        <span className="h-5 w-px bg-border" aria-hidden />
        <label className="sr-only" htmlFor="routines-day-filter">
          Filter by day
        </label>
        <Select
          id="routines-day-filter"
          value={dayFilter}
          onChange={(event) => {
            setDayFilterAndResetPage(event.target.value as DayOfWeek | "");
          }}
          sizeVariant="sm"
          className="w-40"
        >
          <option value="">All days</option>
          {DAYS_OF_WEEK.map((day) => (
            <option key={day} value={day}>
              {DAY_LABELS[day]}
            </option>
          ))}
        </Select>
        <span className="ml-auto pr-1 text-xs font-medium tabular-nums text-muted">
          {total} routine{total === 1 ? "" : "s"}
        </span>
      </div>

      <Modal
        open={!!routineFormMode}
        onClose={closeRoutineForm}
        title={routineFormMode ? routineFormTitle(routineFormMode) : ""}
        className="max-w-3xl"
      >
        {routineFormMode && (
          <RoutineForm
            key={
              routineFormMode.type === "edit"
                ? routineFormMode.routine._id
                : "create"
            }
            mode={routineFormMode}
            labels={labels}
            onClose={closeRoutineForm}
            onSaved={onRoutineSaved}
          />
        )}
      </Modal>

      {isLoading && <p className="text-sm text-muted">Loading routines…</p>}

      {isError && (
        <p className="text-sm text-foreground">
          Could not load routines. Try refreshing the page.
        </p>
      )}

      {isEmpty && (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-14 text-center">
          <p className="font-medium text-foreground">
            {dayFilter ? "No routines for this day" : "No routines yet"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {dayFilter
              ? "Try another day, or create a routine that includes it."
              : "Create a morning or weekly routine, then add it to a day from Tasks."}
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={openCreateRoutine}
            startIcon={<Plus className="w-4" aria-hidden />}
          >
            New routine
          </Button>
        </div>
      )}

      {!isLoading && !isError && routines.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-56">Schedule</TableHead>
              <TableHead className="w-28">Drafts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routines.map((routine: Routine) => (
              <TableRow
                key={routine._id}
                onClick={() => openEditRoutine(routine)}
                aria-label={`Edit routine ${routine.name}`}
              >
                <TableCell>
                  <span className="block truncate font-medium text-foreground">
                    {routine.name}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted">
                    {formatSchedule(routine)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm tabular-nums text-muted">
                    {routine.drafts.length}
                  </span>
                </TableCell>
              </TableRow>
            ))}
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
    </div>
  );
};

export default RoutinesList;
