"use client";

import { useSyncExternalStore } from "react";

import {
  type Act,
  Bar,
  Button,
  Check,
  Collapse,
  Roll,
  Spinner,
  Stage,
  States,
  Text,
  Window,
} from "@/components/stageshow";

import "./deck-draft-demo.css";

// What happens after "Generate": the presenter drafting a deck from a one-line brief. Beats: the
// slides are written top to bottom into their own skeleton, the reviewer flags the market slide,
// the slide is rewritten in place, and the deck is ready to present. It plays once when it comes
// into view and holds the finished deck, so nothing keeps moving beside the form while someone
// types. Under reduced motion it shows only that finished frame (the poster).
//
// Real strings: the brief, the status, each slide's label and title, the reviewer's note.

type Status = "writing" | "review" | "ready";
type S = { written: number; status: Status; note: boolean; fixed: boolean };

const BRIEF = "Locally roasted coffee beans, delivered every week to small offices.";

const SLIDES = [
  { label: "Problem", title: "Offices settle for stale coffee" },
  { label: "Solution", title: "Fresh local beans, every week" },
  { label: "Market", title: "A focused market of small teams" },
  { label: "Business model", title: "Recurring office subscriptions" },
  { label: "The ask", title: "Seed round to prove one city" },
] as const;

/** The market slide, rewritten after review. */
const REVIEWED = { index: 2, title: "4,200 small offices in one city" };

const STATUS: Record<Status, string> = {
  writing: "Writing 5 slides",
  review: "Reviewing the story",
  ready: "Ready to present",
};

// Each placeholder about its words' width, so a row resolves without moving.
const LABEL_W = [44, 50, 42, 86, 48];
const TITLE_W = [190, 178, 196, 186, 172];

const initial: S = { written: 0, status: "writing", note: false, fixed: false };
const finished: S = { written: SLIDES.length, status: "ready", note: true, fixed: true };

async function script(a: Act<S>) {
  await a.wait(900);
  a.mark("write");
  for (let n = 1; n <= SLIDES.length; n++) {
    a.put({ written: n });
    await a.wait(420);
  }
  await a.wait(500);
  a.mark("review");
  await a.set({ status: "review" });
  await a.wait(450);
  await a.set({ note: true });
  await a.wait(1900);
  a.mark("fix");
  await a.set({ fixed: true });
  await a.wait(1500);
  a.mark("ready");
  await a.set({ status: "ready" });
}

export function DeckDraftDemo() {
  const theme = useSiteTheme();

  return (
    <figure aria-label="Preview of a deck being drafted" className="m-0">
      <div aria-hidden="true">
        <Stage<S>
          width={560}
          height={560}
          compact={{ below: 520, width: 358, height: 520 }}
          initial={initial}
          poster={finished}
          script={script}
          play="once"
          theme={theme}
          className="dd"
        >
          {(s) => (
            <Window title="OfficeRoast" className="dd-win">
              <div className="dd-body">
                <div className="dd-brief">
                  <span className="dd-brief-label">Brief</span>
                  <Text wrap className="dd-brief-text">
                    {BRIEF}
                  </Text>
                </div>

                <div className="dd-status">
                  <span className="dd-status-text" data-ready={s.status === "ready" || undefined}>
                    <States
                      value={s.status === "ready" ? "done" : "busy"}
                      states={{ busy: <Spinner size={14} />, done: <Check on size={14} /> }}
                    />
                    <Roll variant="fade">{STATUS[s.status]}</Roll>
                  </span>
                  <Button size="small" variant={s.status === "ready" ? "primary" : "tertiary"}>
                    Present
                  </Button>
                </div>

                <ol className="dd-list">
                  {SLIDES.map((slide, i) => {
                    const reviewed = i === REVIEWED.index;
                    return (
                      <li key={slide.label} className="dd-item">
                        <div
                          className="dd-row"
                          data-ready={i < s.written || undefined}
                          data-selected={(reviewed && s.note && s.status !== "ready") || undefined}
                          style={{ ["--deck" as string]: `var(--deck-${i + 1})` }}
                        >
                          <span className="dd-num">{String(i + 1).padStart(2, "0")}</span>
                          <span className="dd-slot">
                            <span className="dd-sk dd-thumb-sk" />
                            <Thumb />
                          </span>
                          <span className="dd-lines">
                            <span className="dd-slot">
                              <Bar w={LABEL_W[i]} h={6} r={3} tone={2} className="dd-sk" />
                              <span className="dd-real dd-label">{slide.label}</span>
                            </span>
                            <span className="dd-slot">
                              <Bar w={TITLE_W[i]} h={8} r={4} tone={2} className="dd-sk" />
                              <span className="dd-real dd-title">
                                {reviewed ? (
                                  <Roll>{s.fixed ? REVIEWED.title : slide.title}</Roll>
                                ) : (
                                  slide.title
                                )}
                              </span>
                            </span>
                          </span>
                        </div>

                        {reviewed ? (
                          <Collapse open={s.note} className="dd-note-wrap">
                            <div className="dd-note">
                              <Check on={s.fixed} pending={!s.fixed} size={14} />
                              <span className="dd-note-who">Reviewer</span>
                              <Roll variant="fade" className="dd-note-text">
                                {s.fixed ? "Added the market size" : "Say how big the market is"}
                              </Roll>
                            </div>
                          </Collapse>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Window>
          )}
        </Stage>
      </div>
      <figcaption className="sr-only">
        An example deck being drafted from a one-line brief: five slides are written, an independent
        reviewer asks for the market size, the market slide is rewritten, and the deck is ready to
        present.
      </figcaption>
    </figure>
  );
}

/** A whiteboard slide in miniature: a title stroke, a line of copy and one marker sketch. */
function Thumb() {
  return (
    <span className="dd-real dd-thumb">
      <span className="dd-thumb-title" />
      <span className="dd-thumb-copy" />
      <span className="dd-thumb-mark" />
    </span>
  );
}

// The site theme is a class on <html> (components/theme/theme-script.tsx sets it before paint and
// the theme menu switches it), so follow that class rather than the OS preference.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function useSiteTheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light",
  );
}
