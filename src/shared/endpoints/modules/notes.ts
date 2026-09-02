import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateNoteBody,
  IdParam,
  Note,
  NoteListQuery,
  PaginatedResponse,
  UpdateNoteBody,
} from "@/shared/types";

export const notesModule = {
  create: defineEndpoint<Note, CreateNoteBody>({
    method: "POST",
    path: ROUTES.notes.base,
    auth: true,
  }),

  list: defineEndpoint<PaginatedResponse<Note>, never, NoteListQuery>({
    method: "GET",
    path: ROUTES.notes.base,
    auth: true,
  }),

  get: defineEndpoint<Note, never, never, IdParam>({
    method: "GET",
    path: ROUTES.notes.byId,
    auth: true,
  }),

  togglePinned: defineEndpoint<Note, never, never, IdParam>({
    method: "PATCH",
    path: ROUTES.notes.togglePinned,
    auth: true,
  }),

  update: defineEndpoint<Note, UpdateNoteBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.notes.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.notes.byId,
    auth: true,
  }),
} as const;

export type NotesModule = typeof notesModule;
