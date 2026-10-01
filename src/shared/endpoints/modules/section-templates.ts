import { defineEndpoint } from "../types";
import { ROUTES } from "../routes";
import type {
  ApplySectionTemplateBody,
  ApplySectionTemplateResponse,
  CreateSectionTemplateBody,
  IdParam,
  PaginatedResponse,
  SectionTemplate,
  SectionTemplateListQuery,
  UpdateSectionTemplateBody,
} from "@/shared/types";

export const sectionTemplatesModule = {
  create: defineEndpoint<SectionTemplate, CreateSectionTemplateBody>({
    method: "POST",
    path: ROUTES.sectionTemplates.base,
    auth: true,
  }),

  list: defineEndpoint<
    PaginatedResponse<SectionTemplate>,
    never,
    SectionTemplateListQuery
  >({
    method: "GET",
    path: ROUTES.sectionTemplates.base,
    auth: true,
  }),

  get: defineEndpoint<SectionTemplate, never, never, IdParam>({
    method: "GET",
    path: ROUTES.sectionTemplates.byId,
    auth: true,
  }),

  update: defineEndpoint<
    SectionTemplate,
    UpdateSectionTemplateBody,
    never,
    IdParam
  >({
    method: "PUT",
    path: ROUTES.sectionTemplates.byId,
    auth: true,
  }),

  apply: defineEndpoint<
    ApplySectionTemplateResponse,
    ApplySectionTemplateBody,
    never,
    IdParam
  >({
    method: "POST",
    path: ROUTES.sectionTemplates.apply,
    auth: true,
  }),

  delete: defineEndpoint<void, never, never, IdParam>({
    method: "DELETE",
    path: ROUTES.sectionTemplates.byId,
    auth: true,
  }),
} as const;

export type SectionTemplatesModule = typeof sectionTemplatesModule;
