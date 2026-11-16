"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createDeck, type FormState } from "@/src/decks/actions";
import { MAX_IDEA_LENGTH, MIN_IDEA_LENGTH } from "@/src/decks/validation";
import { ArrowRightIcon } from "@/src/components/icons";

const initialState: FormState = { status: "idle" };

const EXAMPLE_IDEAS = [
  {
    label: "Office coffee",
    idea: "A subscription service that delivers locally roasted coffee beans to small offices every week.",
  },
  {
    label: "Tutoring match",
    idea: "An app that matches retired teachers with families who need affordable after-school tutoring.",
  },
  {
    label: "Mobile bike repair",
    idea: "A booking platform for mobile bike mechanics who repair bicycles at the customer's home.",
  },
];

/**
 * Idea form: one writing sheet (label, the idea, a progress line and the submit action), then three
 * example briefs that fill the sheet. The length limits here only guide the visitor; `createDeck`
 * validates again on the server. The textarea is controlled, so React's automatic form reset after
 * an action never clears what the visitor typed when the server rejects it.
 *
 * It is the reason `/new` exists, which every "Create a deck" action opens, so the field is
 * focused when the form mounts.
 */
export function IdeaForm() {
  const [state, formAction, pending] = useActionState(createDeck, initialState);
  const [idea, setIdea] = useState("");
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fieldRef.current?.focus({ preventScroll: true });
  }, []);

  const error = state.status === "error" ? state.message : null;
  const length = idea.trim().length;
  const remaining = MIN_IDEA_LENGTH - length;

  function fillExample(text: string) {
    setIdea(text);
    // Put the caret at the end, so the visitor can keep writing from the example.
    requestAnimationFrame(() => {
      const field = fieldRef.current;
      if (!field) return;
      field.focus();
      field.setSelectionRange(text.length, text.length);
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <div
          data-invalid={error ? true : undefined}
          className={cn(
            "group/sheet overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm ring-1 ring-foreground/10 transition-shadow duration-300",
            "focus-within:shadow-lg focus-within:shadow-primary/5 focus-within:ring-2 focus-within:ring-primary/60",
            "data-invalid:ring-2 data-invalid:ring-destructive/60",
          )}
        >
          <div className="flex items-center justify-between gap-4 px-5 pt-4 sm:px-6">
            <label
              htmlFor="idea"
              className="font-mono text-xs tracking-wider text-muted-foreground uppercase"
            >
              Your idea
            </label>
            <span
              className="font-mono text-xs text-muted-foreground tabular-nums"
              aria-hidden="true"
            >
              {length.toLocaleString("en-US")}/{MAX_IDEA_LENGTH.toLocaleString("en-US")}
            </span>
          </div>

          {/* The writing surface: a whiteboard's dot grid behind large type. */}
          <Textarea
            ref={fieldRef}
            id="idea"
            name="idea"
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            required
            minLength={MIN_IDEA_LENGTH}
            maxLength={MAX_IDEA_LENGTH}
            readOnly={pending}
            rows={6}
            placeholder="We help [who] with [a problem they pay to solve]. They pay us [how], because [why now]."
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "idea-hint idea-error" : "idea-hint"}
            className={cn(
              "min-h-48 resize-none rounded-none border-0 bg-transparent px-5 pt-3 pb-6 text-lg leading-relaxed text-pretty shadow-none sm:px-6 md:text-lg",
              "focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
              "bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[20px_20px] bg-position-[10px_10px]",
              "placeholder:text-muted-foreground/70",
            )}
          />

          <div className="flex flex-col gap-3 border-t border-border bg-muted/40 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p id="idea-hint" className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                aria-hidden="true"
                className={cn(
                  "size-1.5 shrink-0 rounded-full transition-colors duration-300",
                  remaining > 0 ? "bg-muted-foreground/40" : "bg-primary",
                )}
              />
              {remaining > 0
                ? `${MIN_IDEA_LENGTH} characters minimum. Specific beats short.`
                : "Good to go. Price or traction sharpens it."}
            </p>
            <Button
              type="submit"
              disabled={pending}
              className="group/submit h-10 shrink-0 rounded-full px-5 text-sm font-semibold transition-[translate,scale,background-color] duration-300 ease-apple active:scale-[0.97]"
            >
              {pending ? (
                <>
                  <Spinner aria-hidden="true" />
                  Starting your deck…
                </>
              ) : (
                <>
                  Generate deck
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="transition-transform duration-300 ease-apple group-hover/submit:translate-x-0.5"
                  />
                </>
              )}
            </Button>
          </div>
        </div>

        <FieldError id="idea-error">{error}</FieldError>
      </div>

      <section aria-labelledby="examples-label" className="flex flex-col gap-3">
        <h2 id="examples-label" className="text-sm font-medium text-muted-foreground">
          Or start from an example
        </h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {EXAMPLE_IDEAS.map((example) => {
            const active = idea === example.idea;
            return (
              <li key={example.label} className="flex">
                <button
                  type="button"
                  onClick={() => fillExample(example.idea)}
                  disabled={pending}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-xl border border-border bg-background p-3 text-left transition-[border-color,background-color,translate] duration-300 ease-apple outline-none",
                    "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-0",
                    "disabled:pointer-events-none disabled:opacity-50",
                    active && "border-primary/60 bg-card",
                  )}
                >
                  <span className="text-sm font-medium">{example.label}</span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {example.idea}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </form>
  );
}
