"use client";

import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { applyTheme, THEME_STORAGE_KEY, type Theme } from "./helpers";

export type { Theme };

const THEME_CHANGED_EVENT = "quillo-theme-changed";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getStoredTheme = (): Theme | null => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return null;
};

const getSystemTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getClientTheme = (): Theme => getStoredTheme() ?? getSystemTheme();
const getServerTheme = (): Theme => "light";

const subscribeTheme = (onStoreChange: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) onStoreChange();
  };

  window.addEventListener(THEME_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
};

const notifyThemeChanged = () => {
  window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

interface Props {
  children: ReactNode;
}

const ThemeProvider: FC<Props> = ({ children }) => {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getClientTheme,
    getServerTheme,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    notifyThemeChanged();
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
