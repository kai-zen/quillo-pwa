import type {
  Label,
  Note,
  NoteFolder,
  RecordId,
  UpdateNoteBody,
} from "@/shared/types";
import { NotesListViewModel } from "./hooks/useNotesListView";

export const ALL_NOTES = "all";
export const UNFILED_NOTES = "unfiled";
export const UNFILED_QUERY_VALUE = "null";

export type FolderFilter = typeof ALL_NOTES | typeof UNFILED_NOTES | RecordId;

export const isNamedFolder = (filter: FolderFilter): filter is RecordId =>
  filter !== ALL_NOTES && filter !== UNFILED_NOTES;

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

export const findFolder = (
  folderId: RecordId | null,
  folders: NoteFolder[],
): NoteFolder | null => {
  if (!folderId) return null;
  return folders.find((folder) => folder._id === folderId) ?? null;
};

export const folderLabel = (
  folderId: RecordId | null,
  folders: NoteFolder[],
): string => findFolder(folderId, folders)?.name ?? "Unfiled";

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
  folderFilter: NotesListViewModel["folderFilter"],
  showArchived: boolean,
): { title: string; description: string } => {
  if (showArchived) {
    return {
      title: "No archived notes",
      description: "Archived notes will show up here.",
    };
  }
  if (folderFilter === UNFILED_NOTES) {
    return {
      title: "No unfiled notes",
      description: "Notes without a folder will show up here.",
    };
  }
  if (folderFilter !== ALL_NOTES) {
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
