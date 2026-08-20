"use client";

import { NextPage } from "next";
import LoginForm from "@/components/auth/LoginForm";
import AppBrand from "@/components/layout/AppBrand";
import ThemeToggle from "@/components/theme/ThemeToggle";

const LoginPage: NextPage = () => {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <AppBrand />
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 pb-16">
        <LoginForm />
      </main>
    </div>
  );
};

export default LoginPage;
