import type {
  Label,
  Note,
  RecordId,
  UpdateNoteBody,
} from "@/shared/types";

export const UNFILED_QUERY_VALUE = "null";

export const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return "";
  return value.slice(0, 10);
};

export const formatNoteDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const isoDay = toDateInputValue(value);
  const hasTime = value.includes("T");
  const date = new Date(hasTime ? value : `${isoDay}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDay;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const labelsById = (labels: Label[]): Map<RecordId, Label> =>
  new Map(labels.map((label) => [label._id, label]));

export const comparePinnedFirst = (a: Note, b: Note): number => {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return b.updated_at.localeCompare(a.updated_at);
};

export const toUpdateBody = (note: Note): UpdateNoteBody => ({
  title: note.title,
  content: note.content,
  folder_id: note.folder_id,
  label_ids: note.label_ids,
  goal_id: note.goal_id,
  sprint_id: note.sprint_id,
  date: note.date ? toDateInputValue(note.date) : null,
  pinned: note.pinned,
  archived: note.archived,
});

export const notesEmptyCopy = (
  inFolder: boolean,
  showArchived: boolean,
): { title: string; description: string } => {
  if (showArchived) {
    return {
      title: "No archived notes",
      description: "Archived notes will show up here.",
    };
  }
  if (inFolder) {
    return {
      title: "No notes in this folder",
      description: "Create a note, or pick another folder.",
    };
  }
  return {
    title: "No notes yet",
    description: "Capture ideas, meeting notes, or anything outside a task.",
  };
};
