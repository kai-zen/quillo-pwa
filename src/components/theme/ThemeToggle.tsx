"use client";

import { Moon, Sun } from "lucide-react";
import { FC } from "react";
import { useTheme } from "./ThemeProvider";

const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-md p-2 text-muted transition-colors hover:bg-accent-soft hover:text-foreground cursor-pointer"
      aria-label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" aria-hidden />
      ) : (
        <Sun className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
};

export default ThemeToggle;
