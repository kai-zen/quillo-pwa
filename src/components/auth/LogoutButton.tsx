"use client";

import { LogOut } from "lucide-react";
import { FC } from "react";
import { IconButton } from "@/components/common";
import { useAuth } from "./AuthProvider";

const LogoutButton: FC = () => {
  const { logout } = useAuth();

  return (
    <IconButton label="Log out" onClick={logout}>
      <LogOut className="h-4 w-4" aria-hidden />
    </IconButton>
  );
};

export default LogoutButton;
