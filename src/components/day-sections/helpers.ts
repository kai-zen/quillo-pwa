import type { DailySection, SectionTemplateSection } from "@/shared/types";

export const DEFAULT_SECTION_TITLE = "Untitled";

export const sectionDisplayTitle = (title: string) =>
  title.trim() || DEFAULT_SECTION_TITLE;

export const sortSections = <T extends { sort_order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.sort_order - b.sort_order);

export const sectionsFromDaily = (sections: DailySection[]) =>
  sortSections(sections);

export const sectionsFromTemplate = (sections: SectionTemplateSection[]) =>
  sortSections(sections);

export const formatSectionCount = (count: number) =>
  `${count} section${count === 1 ? "" : "s"}`;
