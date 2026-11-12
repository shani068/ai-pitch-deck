# Spec Delta

## MODIFIED Requirements

### Requirement: The hero starts a deck

The hero SHALL show a short eyebrow, a headline, one supporting paragraph, a "Create a deck" action that leads to `/new`, a "See an example" action that leads to the Example section, and a decorative preview built from the sample deck. The hero SHALL NOT contain the idea form, and rendering it SHALL NOT read the visitor's session. On narrow screens, the text and actions SHALL come before the preview.

#### Scenario: Starting from the hero

- **WHEN** a signed-in person chooses "Create a deck" in the hero
- **THEN** they reach the idea form at `/new`

#### Scenario: Starting from the hero while signed out

- **WHEN** a signed-out visitor chooses "Create a deck" in the hero
- **THEN** they are asked to sign in first and are brought to `/new` afterwards

#### Scenario: Narrow screen

- **WHEN** the home page is viewed 375 px wide
- **THEN** the headline and actions appear before the preview, and nothing scrolls horizontally

#### Scenario: Closing call to action

- **WHEN** a visitor chooses the closing call to action
- **THEN** they are taken to `/new`, as with the hero's "Create a deck"

#### Scenario: Home page stays static

- **WHEN** the app is built for production
- **THEN** the home page is listed as static, and the built page contains no idea form

## ADDED Requirements

### Requirement: Motion and surfaces follow one standard

Decorative effects on the home page, such as soft glows, gradient accents, frosted surfaces, entrance animation and scroll-driven storytelling, SHALL use only the design tokens and the shared ease-out curve, in both colour schemes. Hover movement SHALL animate rather than jump. Decorative elements SHALL be hidden from assistive technology and SHALL NOT cause horizontal scrolling. With reduced motion, these effects SHALL happen without motion.

#### Scenario: Smooth hover

- **WHEN** a pointer moves onto a hero action or the hero preview
- **THEN** it lifts gradually over a transition instead of jumping to its raised position

#### Scenario: Reduced motion

- **WHEN** a visitor's system requests reduced motion
- **THEN** entrance animations, hover movement and glides complete without visible motion, and nothing on the page moves on its own

#### Scenario: Decorative content stays out of the way

- **WHEN** the home page is viewed 375 px wide, or read with a screen reader
- **THEN** no glow or decorative preview causes horizontal scrolling or is announced

### Requirement: How it works is a pinned, scroll-driven timeline

The How it works steps SHALL stay pinned below the header, fully visible, while the visitor scrolls through the section. The visitor's scroll position alone SHALL advance and rewind the steps from 1 to 3; nothing SHALL play on its own. Only the active step SHALL show its highlighted line. The page SHALL scroll on past the section only after every step has been shown.

#### Scenario: Pinned while scrolling

- **WHEN** a visitor scrolls into How it works on a 1280 × 860 or a 375 × 667 screen
- **THEN** the step list stays in place below the header and fully visible while the steps advance

#### Scenario: Scrolling drives the steps

- **WHEN** the visitor keeps scrolling down, then scrolls back up
- **THEN** the steps advance from 1 to 3 in order, then rewind, following the scroll position

#### Scenario: One active line

- **WHEN** the timeline moves from one step to the next
- **THEN** the previous step's highlighted line fades out and only the new active step shows its line

#### Scenario: A fast scroll does not skip steps

- **WHEN** a visitor flicks or wheels quickly through the section
- **THEN** each step is shown on its own, briefly, before the page moves past it

#### Scenario: Release after the last step

- **WHEN** step 3 has been shown and the visitor keeps scrolling
- **THEN** the section unpins and the page scrolls on to the next section

#### Scenario: Links are never held

- **WHEN** a visitor follows a header link to the Features or Example section from above
- **THEN** the page scrolls straight to that section without stopping in How it works

#### Scenario: Choosing a step

- **WHEN** a visitor activates a step's button
- **THEN** the page scrolls to the point where that step is active and fully shown

## REMOVED Requirements

### Requirement: The design stays restrained

**Reason**: The product owner chose a richer visual direction (glows, gradient accents, frosted surfaces, entrance animation and a scroll-driven timeline) for the home page.

**Migration**: Replaced by "Motion and surfaces follow one standard" and "How it works is a pinned, scroll-driven timeline". Reduced-motion support is kept.
