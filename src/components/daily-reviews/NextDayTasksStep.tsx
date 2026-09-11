"use client";

import { Plus, Repeat } from "lucide-react";
import { FC, useId } from "react";
import { Button, Input } from "@/components/common";
import { formatDayShort } from "@/components/tasks/helpers";
import { useNextDayTasks } from "./useNextDayTasks";

interface Props {
  nextDate: string;
  onBack: () => void;
  onDone: () => void;
  onApplyRoutines: () => void;
}

const NextDayTasksStep: FC<Props> = ({
  nextDate,
  onBack,
  onDone,
  onApplyRoutines,
}) => {
  const inputId = useId();
  const view = useNextDayTasks(nextDate);
  const dateLabel = formatDayShort(nextDate);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        What do you want to tackle on {dateLabel}? Add a few tasks now so
        tomorrow starts with a plan.
      </p>

      <form onSubmit={view.addTask} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          New task for {dateLabel}
        </label>
        <Input
          id={inputId}
          value={view.draft}
          onChange={(event) => view.setDraft(event.target.value)}
          placeholder="What needs doing?"
          disabled={view.pending}
          autoFocus
        />
        <Button
          type="submit"
          disabled={view.pending || !view.draft.trim()}
          aria-label="Add task"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </Button>
      </form>

      {view.isLoading && (
        <p className="text-sm text-muted">Loading tasks for {dateLabel}…</p>
      )}

      {view.isError && (
        <p className="text-sm text-foreground">
          Could not load tasks for this day. You can still add new ones below.
        </p>
      )}

      {!view.isLoading && view.tasks.length > 0 && (
        <ul className="max-h-[40vh] overflow-y-auto rounded-xl border border-border">
          {view.tasks.map((task) => (
            <li
              key={task._id}
              className="border-b border-border px-3 py-2.5 text-sm last:border-b-0"
            >
              {task.title}
            </li>
          ))}
        </ul>
      )}

      {!view.isLoading && view.tasks.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-accent-soft/40 px-4 py-8 text-center">
          <p className="text-sm text-muted">Nothing planned yet for {dateLabel}.</p>
        </div>
      )}

      {view.error && <p className="text-sm text-rose-500">{view.error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        <Button
          variant="secondary"
          className="mr-auto"
          onClick={onApplyRoutines}
          disabled={view.pending}
        >
          <Repeat className="h-4 w-4" aria-hidden />
          Add from routines
        </Button>
        <Button variant="ghost" onClick={onBack} disabled={view.pending}>
          Back
        </Button>
        <Button onClick={onDone} disabled={view.pending}>
          Done
        </Button>
      </div>
    </div>
  );
};

export default NextDayTasksStep;
