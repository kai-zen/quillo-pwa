"use client";

import { Pin } from "lucide-react";
import { FC } from "react";
import { Markdown } from "@/components/common";
import {
  useGoalsApi,
  useLabelsApi,
  useProjectsApi,
  useSprintsApi,
} from "@/shared/hooks";
import type { Label, Note } from "@/shared/types";
import { formatNoteDate, labelsById } from "./helpers";

interface Props {
  note: Note;
}

const Chip: FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-foreground">
    {label}
  </span>
);

const NoteReader: FC<Props> = ({ note }) => {
  const { useLabelsList } = useLabelsApi();
  const { useGoal } = useGoalsApi();
  const { useSprint } = useSprintsApi();
  const { useProject } = useProjectsApi();

  const labelsQuery = useLabelsList({ page: 1, limit: 100 });
  const goalQuery = useGoal(note.goal_id ?? "", !!note.goal_id);
  const sprintQuery = useSprint(note.sprint_id ?? "", !!note.sprint_id);
  const projectQuery = useProject(note.project_id ?? "", !!note.project_id);

  const labelMap = labelsById(labelsQuery.data?.items ?? []);
  const labels = note.label_ids
    .map((id) => labelMap.get(id))
    .filter((label): label is Label => !!label);
  const goalTitle = goalQuery.data?.title ?? "Goal";
  const sprintName = sprintQuery.data?.name ?? "Sprint";
  const projectName = projectQuery.data?.name ?? "Project";
  const hasMeta = !!(
    note.date ||
    note.goal_id ||
    note.sprint_id ||
    note.project_id ||
    note.pinned
  );

  return (
    <div className="flex w-full flex-col gap-3">
      {hasMeta && (
        <div className="flex flex-wrap items-center gap-1.5">
          {note.pinned && (
            <span className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-foreground">
              <Pin className="h-3 w-3 fill-current" aria-hidden />
              Pinned
            </span>
          )}
          {note.date && <Chip label={formatNoteDate(note.date)} />}
          {note.goal_id && <Chip label={goalTitle} />}
          {note.sprint_id && <Chip label={sprintName} />}
          {note.project_id && <Chip label={projectName} />}
        </div>
      )}

      {note.content.trim() ? (
        <Markdown>{note.content}</Markdown>
      ) : (
        <p className="text-sm text-muted">No content</p>
      )}

      {(labels.length > 0 || note.updated_at) && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-3">
          <span className="mr-auto text-xs text-muted">
            Updated {formatNoteDate(note.updated_at)}
          </span>
          {labels.map((label) => (
            <span
              key={label._id}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-foreground"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: label.color }}
                aria-hidden
              />
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteReader;
