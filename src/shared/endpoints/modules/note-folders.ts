import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  CreateNoteFolderBody,
  IdParam,
  NoteFolder,
  NoteFolderListQuery,
  PaginatedResponse,
  UpdateNoteFolderBody,
} from "@/shared/types";

export const noteFoldersModule = {
  create: defineEndpoint<NoteFolder, CreateNoteFolderBody>({
    method: "POST",
    path: ROUTES.noteFolders.base,
    auth: true,
  }),

  list: defineEndpoint<
    PaginatedResponse<NoteFolder>,
    never,
    NoteFolderListQuery
  >({
    method: "GET",
    path: ROUTES.noteFolders.base,
    auth: true,
  }),

  get: defineEndpoint<NoteFolder, never, never, IdParam>({
    method: "GET",
    path: ROUTES.noteFolders.byId,
    auth: true,
  }),

  update: defineEndpoint<NoteFolder, UpdateNoteFolderBody, never, IdParam>({
    method: "PUT",
    path: ROUTES.noteFolders.byId,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.noteFolders.byId,
    auth: true,
  }),
} as const;

export type NoteFoldersModule = typeof noteFoldersModule;
