"use client";

import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LaptopIcon, MoonIcon, SunIcon } from "@/src/components/icons";

import {
  DARK_QUERY,
  parseThemeChoice,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemeChoice,
} from "./theme";

const THEME_EVENT = "themechange";

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: LaptopIcon },
];

// Used only when storage is blocked: the choice then applies to this page but isn't remembered.
let unsavedChoice: string | null = null;

function readStored(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return unsavedChoice;
  }
}

function applyTheme() {
  const dark = resolveTheme(readStored(), window.matchMedia(DARK_QUERY).matches) === "dark";
  document.documentElement.classList.toggle("dark", dark);
}

function setThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    unsavedChoice = choice === "system" ? null : choice;
  }
  applyTheme();
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** Re-renders on a choice made here or in another tab, and follows OS changes while on System. */
function subscribe(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    if (parseThemeChoice(readStored()) === "system") applyTheme();
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
    applyTheme();
    onChange();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

const getChoice = () => parseThemeChoice(readStored());
// The server cannot know the visitor's choice; the client corrects it right after hydration.
const getServerChoice = (): ThemeChoice => "system";

export function ThemeMenu() {
  const choice = useSyncExternalStore(subscribe, getChoice, getServerChoice);
  const current = OPTIONS.find((option) => option.value === choice) ?? OPTIONS[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change theme"
          title="Change theme"
          className="rounded-full"
        >
          <current.Icon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={choice}
          onValueChange={(value) => setThemeChoice(parseThemeChoice(value))}
        >
          {OPTIONS.map(({ value, label, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon aria-hidden="true" />
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
