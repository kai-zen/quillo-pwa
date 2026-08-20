"use client";

import { Moon, Sun } from "lucide-react";
import { FC } from "react";
import { IconButton } from "@/components/common";
import { useTheme } from "./ThemeProvider";

const ThemeToggle: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      label={
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
      }
      onClick={toggleTheme}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" aria-hidden />
      ) : (
        <Sun className="h-5 w-5" aria-hidden />
      )}
    </IconButton>
  );
};

export default ThemeToggle;
