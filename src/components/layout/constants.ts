import {
  Flag,
  FolderKanban,
  Inbox,
  LayoutTemplate,
  ListTodo,
  Repeat,
  StickyNote,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  is_primary: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { is_primary: true, href: "/", label: "Tasks", icon: ListTodo },
  { is_primary: true, href: "/notes", label: "Notes", icon: StickyNote },
  { is_primary: false, href: "/backlog", label: "Backlog", icon: Inbox },
  { is_primary: true, href: "/sprints", label: "Sprints", icon: Flag },
  { is_primary: false, href: "/goals", label: "Goals", icon: Target },
  {
    is_primary: true,
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
  },
  { is_primary: false, href: "/routines", label: "Routines", icon: Repeat },
  {
    is_primary: false,
    href: "/day-templates",
    label: "Day templates",
    icon: LayoutTemplate,
  },
  {
    is_primary: false,
    href: "/progresses",
    label: "Progress",
    icon: TrendingUp,
  },
];

export const MOBILE_PRIMARY_NAV_ITEMS = NAV_ITEMS.filter(
  (item) => item.is_primary,
);
