import { Flag, Inbox, ListTodo, Repeat, Target, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Tasks", icon: ListTodo },
  { href: "/backlog", label: "Backlog", icon: Inbox },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/sprints", label: "Sprints", icon: Flag },
  { href: "/routines", label: "Routines", icon: Repeat },
];
