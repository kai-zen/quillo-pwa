"use client";

import Link from "next/link";
import { FC } from "react";
import { NAV_ITEMS } from "./constants";
import NavProjectsAccordion from "./NavProjectsAccordion";

interface Props {
  pathname: string;
  onNavigate?: () => void;
  itemClassName?: string;
}

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

const SidebarNavItems: FC<Props> = ({
  pathname,
  onNavigate,
  itemClassName = "py-2",
}) => (
  <>
    {NAV_ITEMS.map((item) => {
      if (item.href === "/projects") {
        return (
          <NavProjectsAccordion
            key={item.href}
            pathname={pathname}
            onNavigate={onNavigate}
            itemClassName={itemClassName}
          />
        );
      }

      const active = isActive(pathname, item.href);
      const Icon = item.icon;

      return (
        <Link
          key={item.href}
          href={item.href}
          className={[
            "flex items-center gap-2.5 rounded-md px-3 text-sm transition-colors",
            itemClassName,
            active
              ? "bg-accent-soft font-medium text-nav-active"
              : "text-muted hover:bg-background hover:text-foreground",
          ].join(" ")}
          aria-current={active ? "page" : undefined}
          onClick={onNavigate}
        >
          <Icon
            className="h-4 w-4 shrink-0"
            strokeWidth={active ? 2.25 : 2}
            aria-hidden
          />
          {item.label}
        </Link>
      );
    })}
  </>
);

export default SidebarNavItems;
