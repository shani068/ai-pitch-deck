import { describe, expect, it } from "vite-plus/test";

import { parseThemeChoice, resolveTheme, THEME_SCRIPT, THEME_STORAGE_KEY } from "./theme";

type Storage = { getItem(key: string): string | null };

/** Runs THEME_SCRIPT against fake browser globals and returns whether `.dark` ended up set. */
function runScript(storage: Storage | "throws", prefersDark: boolean, startDark = false) {
  const classes = new Set(startDark ? ["dark"] : []);
  const document = {
    documentElement: {
      classList: {
        toggle(name: string, force: boolean) {
          if (force) classes.add(name);
          else classes.delete(name);
        },
      },
    },
  };
  const window = {
    matchMedia: (query: string) => ({ matches: query.includes("dark") && prefersDark }),
    get localStorage(): Storage {
      if (storage === "throws") throw new Error("SecurityError");
      return storage;
    },
  };
  // oxlint-disable-next-line typescript/no-implied-eval -- evaluates the constant script under test
  new Function("window", "document", THEME_SCRIPT)(window, document);
  return classes.has("dark");
}

const storageWith = (value: string | null): Storage => ({
  getItem: (key) => (key === THEME_STORAGE_KEY ? value : null),
});

describe("resolveTheme", () => {
  it.each([
    [null, false, "light"],
    [null, true, "dark"],
    ["system", true, "dark"],
    ["light", true, "light"],
    ["dark", false, "dark"],
    ["garbage", true, "dark"],
  ] as const)("stored %j with prefersDark=%j resolves to %s", (stored, prefersDark, expected) => {
    expect(resolveTheme(stored, prefersDark)).toBe(expected);
  });
});

describe("parseThemeChoice", () => {
  it("treats anything but light or dark as system", () => {
    expect(parseThemeChoice("light")).toBe("light");
    expect(parseThemeChoice("dark")).toBe("dark");
    expect(parseThemeChoice(null)).toBe("system");
    expect(parseThemeChoice("Dark")).toBe("system");
  });
});

describe("THEME_SCRIPT", () => {
  const storedValues = [null, "light", "dark", "system", "garbage"];

  for (const stored of storedValues) {
    for (const prefersDark of [false, true]) {
      it(`matches resolveTheme for stored ${JSON.stringify(stored)}, prefersDark=${prefersDark}`, () => {
        const expected = resolveTheme(stored, prefersDark) === "dark";
        expect(runScript(storageWith(stored), prefersDark)).toBe(expected);
        // Starting from the opposite class must still end in the resolved one.
        expect(runScript(storageWith(stored), prefersDark, !expected)).toBe(expected);
      });
    }
  }

  it.each([false, true])(
    "falls back to the OS preference when storage throws (dark=%j)",
    (prefersDark) => {
      expect(runScript("throws", prefersDark)).toBe(prefersDark);
    },
  );

  it("contains no interpolation placeholders", () => {
    expect(THEME_SCRIPT).not.toContain("${");
  });
});
