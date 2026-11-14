"use client";

import { useSyncExternalStore } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import {
  AlertTriangleIcon,
  CheckTickCircleIcon,
  InformationCircleIcon,
  MultipleCrossCancelCircleIcon,
} from "@/src/components/icons";

// shadcn's Toaster, adapted: the theme comes from the `.dark` class that
// components/theme/theme-script.tsx and theme-menu.tsx manage (no next-themes), and the icons are
// Pikaicons. Watching the class covers every way the theme changes: the menu, another tab, the OS.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getTheme = (): ToasterProps["theme"] =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";
const getServerTheme = (): ToasterProps["theme"] => "system";

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CheckTickCircleIcon className="size-4 text-primary" />,
        info: <InformationCircleIcon className="size-4 text-primary" />,
        warning: <AlertTriangleIcon className="size-4 text-highlight" />,
        error: <MultipleCrossCancelCircleIcon className="size-4 text-destructive" />,
        loading: <Spinner aria-hidden="true" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "calc(var(--radius) * 1.8)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "font-sans shadow-xl shadow-primary/10 gap-3",
          title: "font-semibold",
          description: "text-muted-foreground!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
