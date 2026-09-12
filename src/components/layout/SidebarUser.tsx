"use client";

import { FC } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import { useAuth } from "@/components/auth/AuthProvider";

const SidebarUser: FC = () => {
  const { user } = useAuth();
  const username = user?.username ?? "";
  const initial = username ? username.charAt(0).toUpperCase() : "?";

  return (
    <div
      className="mt-auto shrink-0 border-t border-border pt-4"
      role="group"
      aria-label={username ? `Signed in as ${username}` : "Account"}
    >
      <div className="flex items-center gap-2 px-1">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-foreground"
          aria-hidden
        >
          {initial}
        </div>
        <span
          className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
          title={username || undefined}
        >
          {username || "…"}
        </span>
        <LogoutButton />
      </div>
    </div>
  );
};

export default SidebarUser;
