"use client";

import { usePathname, useRouter } from "next/navigation";
import { FC, ReactNode, useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "./AuthProvider";

const LOGIN_PATH = "/login";
const OFFLINE_PATH = "/~offline";

interface Props {
  children: ReactNode;
}

const AuthGuard: FC<Props> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();
  const isLogin = pathname === LOGIN_PATH;
  const isOffline = pathname === OFFLINE_PATH;

  useEffect(() => {
    if (isLoading || isOffline) return;
    if (!isAuthenticated && !isLogin) router.replace(LOGIN_PATH);
    if (isAuthenticated && isLogin) router.replace("/");
  }, [isAuthenticated, isLoading, isLogin, isOffline, router]);

  if (isOffline) return children;

  if (isLoading) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sm text-muted">
        Loading
      </div>
    );
  }

  if (!isAuthenticated && !isLogin) return null;
  if (isAuthenticated && isLogin) return null;
  if (isLogin) return children;

  return <AppShell>{children}</AppShell>;
};

export default AuthGuard;
