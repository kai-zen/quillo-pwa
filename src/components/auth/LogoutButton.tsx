"use client";

import { LogOut } from "lucide-react";
import { FC } from "react";
import { useAuth } from "./AuthProvider";

const LogoutButton: FC = () => {
  const { logout } = useAuth();

  return (
    <button
      type="button"
      onClick={logout}
      className="cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-accent-soft hover:text-foreground"
      aria-label="Log out"
    >
      <LogOut className="h-4 w-4" aria-hidden />
    </button>
  );
};

export default LogoutButton;
