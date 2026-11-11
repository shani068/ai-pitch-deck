// Pure theme logic shared by the before-paint script and the theme menu. Free of browser globals
// at import time, so Vitest can import it.

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

/** localStorage key holding "light" or "dark". Missing means "follow the system". */
export const THEME_STORAGE_KEY = "theme";

export const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Anything other than an explicit "light" or "dark" means the visitor follows the system. */
export function parseThemeChoice(stored: string | null | undefined): ThemeChoice {
  return stored === "light" || stored === "dark" ? stored : "system";
}

export function resolveTheme(
  stored: string | null | undefined,
  prefersDark: boolean,
): ResolvedTheme {
  const choice = parseThemeChoice(stored);
  if (choice === "system") return prefersDark ? "dark" : "light";
  return choice;
}

/**
 * Runs in <head> before first paint and sets `.dark` on <html>, so the page never flashes the
 * wrong scheme. It must mirror `resolveTheme` (theme.test.ts checks this). If storage is blocked
 * it falls back to the OS preference. It is a constant: no user data is ever interpolated.
 */
export const THEME_SCRIPT = `(function(){var d=false;try{d=window.matchMedia("${DARK_QUERY}").matches}catch(e){}var t=null;try{t=window.localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(t==="dark")d=true;else if(t==="light")d=false;document.documentElement.classList.toggle("dark",d)})()`;
