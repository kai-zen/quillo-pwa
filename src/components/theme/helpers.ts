export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "quillo_theme";

export const THEME_COLORS = {
  light: "#ffffff",
  dark: "#000000",
} as const;

export const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  const color = THEME_COLORS[theme];
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", color));
};

function applyStoredTheme(
  storageKey: string,
  colors: { light: string; dark: string },
) {
  try {
    const stored = localStorage.getItem(storageKey);
    const hasPreference = stored === "light" || stored === "dark";
    const dark = hasPreference
      ? stored === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
    const color = dark ? colors.dark : colors.light;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute("content", color);
    });
  } catch {
    // localStorage / matchMedia can throw (private mode, blocked storage).
  }
}

export const THEME_BLOCKING_SCRIPT = `(${applyStoredTheme.toString()})(${JSON.stringify(THEME_STORAGE_KEY)},${JSON.stringify(THEME_COLORS)})`;
