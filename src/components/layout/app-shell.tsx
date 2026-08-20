"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, ReactNode } from "react";
import AppBrand from "./app-brand";
import { NAV_ITEMS } from "./nav";

interface Props {
  children: ReactNode;
}

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

const AppShell: FC<Props> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-surface/80 px-4 py-6 backdrop-blur-sm md:flex">
        <div className="mb-10">
          <AppBrand />
        </div>

        <nav className="flex flex-col gap-1" aria-label="Main">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent-soft font-medium text-nav-active"
                    : "text-muted hover:bg-background hover:text-foreground",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
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
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center border-b border-border bg-surface/70 px-4 py-3 backdrop-blur-sm md:hidden">
          <AppBrand />
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface/95 backdrop-blur-sm md:hidden"
        aria-label="Main"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors",
                active
                  ? "font-medium text-nav-active"
                  : "text-muted hover:text-foreground",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className="h-5 w-5 shrink-0"
                strokeWidth={active ? 2.25 : 2}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AppShell;
