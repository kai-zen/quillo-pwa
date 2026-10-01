"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request, sectionTemplatesModule } from "@/shared/endpoints";
import type {
  ApplySectionTemplateBody,
  CreateSectionTemplateBody,
  RecordId,
  SectionTemplateListQuery,
  UpdateSectionTemplateBody,
} from "@/shared/types";
import { queryKeys } from "./keys";

export const useSectionTemplatesApi = () => {
  const queryClient = useQueryClient();

  const invalidateSectionTemplates = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.sectionTemplates.all,
    });

  const invalidateAfterApply = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.dailySections.all }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.sectionTemplates.all,
      }),
    ]);
  };

  const useSectionTemplatesList = (
    query?: SectionTemplateListQuery,
    enabled = true,
  ) =>
    useQuery({
      queryKey: queryKeys.sectionTemplates.list(query),
      queryFn: () => request(sectionTemplatesModule.list, { query }),
      enabled,
    });

  const useSectionTemplate = (id: RecordId, enabled = true) =>
    useQuery({
      queryKey: queryKeys.sectionTemplates.detail(id),
      queryFn: () => request(sectionTemplatesModule.get, { params: { id } }),
      enabled: enabled && !!id,
    });

  const createSectionTemplateMutation = useMutation({
    mutationFn: (body: CreateSectionTemplateBody) =>
      request(sectionTemplatesModule.create, { body }),
    onSuccess: invalidateSectionTemplates,
  });

  const updateSectionTemplateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: RecordId;
      body: UpdateSectionTemplateBody;
    }) => request(sectionTemplatesModule.update, { body, params: { id } }),
    onSuccess: invalidateSectionTemplates,
  });

  const deleteSectionTemplateMutation = useMutation({
    mutationFn: (id: RecordId) =>
      request(sectionTemplatesModule.delete, { params: { id } }),
    onSuccess: invalidateSectionTemplates,
  });

  const applySectionTemplateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: RecordId;
      body: ApplySectionTemplateBody;
    }) => request(sectionTemplatesModule.apply, { body, params: { id } }),
    onSuccess: invalidateAfterApply,
  });

  return {
    useSectionTemplatesList,
    useSectionTemplate,
    createSectionTemplate: createSectionTemplateMutation.mutateAsync,
    updateSectionTemplate: (id: RecordId, body: UpdateSectionTemplateBody) =>
      updateSectionTemplateMutation.mutateAsync({ id, body }),
    deleteSectionTemplate: deleteSectionTemplateMutation.mutateAsync,
    applySectionTemplate: (id: RecordId, body: ApplySectionTemplateBody) =>
      applySectionTemplateMutation.mutateAsync({ id, body }),
    isCreating: createSectionTemplateMutation.isPending,
    isUpdating: updateSectionTemplateMutation.isPending,
    isDeleting: deleteSectionTemplateMutation.isPending,
    isApplying: applySectionTemplateMutation.isPending,
  };
};
