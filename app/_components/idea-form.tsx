"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
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
 * Idea form. The length limits here only guide the visitor; `createDeck` validates again on the
 * server. The textarea is controlled, so React's automatic form reset after an action never
 * clears what the visitor typed when the server rejects it.
 *
 * It is the only thing on `/new`, which every "Create a deck" action opens, so the field is
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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="idea" className="text-base font-semibold">
          Describe your business idea
        </FieldLabel>
        <Textarea
          ref={fieldRef}
          id="idea"
          name="idea"
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          required
          minLength={MIN_IDEA_LENGTH}
          maxLength={MAX_IDEA_LENGTH}
          rows={5}
          placeholder="Who is it for, what problem does it solve, and how will it make money?"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "idea-hint idea-error" : "idea-hint"}
          className="min-h-32 resize-y bg-background px-3.5 py-3 text-base leading-relaxed md:text-base"
        />
        <div className="flex items-start justify-between gap-4">
          <FieldDescription id="idea-hint">
            At least {MIN_IDEA_LENGTH} characters. The more specific, the better the deck.
          </FieldDescription>
          <span
            className="shrink-0 font-mono text-xs leading-5 text-muted-foreground tabular-nums"
            aria-hidden="true"
          >
            {length.toLocaleString("en-US")}/{MAX_IDEA_LENGTH.toLocaleString("en-US")}
          </span>
        </div>
        <FieldError id="idea-error">{error}</FieldError>
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={pending} className="h-11 px-5 text-base">
          {pending ? (
            <>
              <Spinner aria-hidden="true" />
              Starting your deck…
            </>
          ) : (
            <>
              Generate pitch deck
              <ArrowRightIcon aria-hidden="true" />
            </>
          )}
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground" id="examples-label">
            Try:
          </span>
          <ul className="contents" aria-labelledby="examples-label">
            {EXAMPLE_IDEAS.map((example) => (
              <li key={example.label}>
                <button
                  type="button"
                  onClick={() => setIdea(example.idea)}
                  disabled={pending}
                  title={example.idea}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm text-muted-foreground transition-colors outline-none hover:border-primary/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  {example.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </form>
  );
}
