/** Home page sections linked from the header, the mobile menu and the footer. */
export const SECTION_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#example", label: "Example" },
] as const;

/** Where every "Create a deck" action leads: the idea form, for signed-in users only. */
export const CREATE_DECK_HREF = "/new";
