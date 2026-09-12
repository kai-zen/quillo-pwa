"use client";

import { LogOut } from "lucide-react";
import { FC, useState } from "react";
import { ConfirmModal, IconButton } from "@/components/common";
import { useAuth } from "./AuthProvider";

const LogoutButton: FC = () => {
  const { logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <IconButton
        label="Log out"
        size="sm"
        onClick={() => setConfirmOpen(true)}
      >
        <LogOut className="h-4 w-4" aria-hidden />
      </IconButton>
      <ConfirmModal
        open={confirmOpen}
        title="Log out"
        description="You’ll need to sign in again to continue."
        confirmLabel="Log out"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          logout();
        }}
      />
    </>
  );
};

export default LogoutButton;
