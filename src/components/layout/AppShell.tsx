"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { FC, ReactNode, useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import AppBrand from "./AppBrand";
import { MOBILE_PRIMARY_NAV_ITEMS, NAV_ITEMS } from "./constants";
import SidebarUser from "./SidebarUser";

interface Props {
  children: ReactNode;
}

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
};

const AppShell: FC<Props> = ({ children }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <aside className="sticky top-0 hidden h-svh w-52 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <div className="mb-10">
          <AppBrand />
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" aria-label="Main">
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

        <SidebarUser />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:justify-end md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              className="rounded-md p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
              aria-label="Open navigation menu"
              aria-controls="mobile-navigation"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <AppBrand />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8">
          {children}
        </main>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-foreground/20"
            aria-label="Close navigation menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav
            id="mobile-navigation"
            className="relative flex h-full w-72 flex-col border-r border-border bg-surface px-4 py-5 shadow-xl motion-safe:animate-[drawer-slide-in_150ms_ease-out]"
            aria-label="Main"
          >
            <div className="mb-8 flex items-center justify-between">
              <AppBrand />
              <button
                type="button"
                className="rounded-md p-2 text-muted transition-colors hover:bg-background hover:text-foreground"
                aria-label="Close navigation menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-accent-soft font-medium text-nav-active"
                        : "text-muted hover:bg-background hover:text-foreground",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
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
            </div>

            <SidebarUser />
          </nav>
        </div>
      )}

      <nav
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-border bg-surface md:hidden"
        aria-label="Main"
      >
        {MOBILE_PRIMARY_NAV_ITEMS.map((item) => {
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
