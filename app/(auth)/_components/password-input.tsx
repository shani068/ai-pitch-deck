"use client";

import { useState } from "react";

import { EyeOffIcon, EyeOnIcon, LockCloseIcon } from "@/src/components/icons";

import { IconInput, type IconInputProps } from "./icon-input";

/** Password field with a show/hide toggle whose name states the action it will take. */
export function PasswordInput(props: Omit<IconInputProps, "icon" | "type" | "trailing">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOffIcon : EyeOnIcon;

  return (
    <IconInput
      {...props}
      icon={LockCloseIcon}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={props.id}
          className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Icon aria-hidden="true" className="size-[18px]" />
        </button>
      }
    />
  );
}
