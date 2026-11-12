# marketing-home Specification

## Purpose

Defines the home page as the product's front door: it explains what AI Pitch Deck does, shows a real example of its output, lets the visitor start a deck immediately, and makes only claims the product can back up.

## Requirements

### Requirement: The home page is ordered as a product landing page

The home page SHALL present, in this order:

- a hero;
- a strip of product facts;
- a How it works section;
- a Features section;
- an Example section;
- an FAQ;
- a closing call to action.

The How it works, Features and Example sections SHALL be reachable by in-page links.

#### Scenario: Section order

- **WHEN** the home page renders
- **THEN** its sections appear in this order: hero, facts, How it works, Features, Example, FAQ, closing call to action

#### Scenario: In-page links

- **WHEN** a visitor follows a link to `/#how-it-works`, `/#features` or `/#example`
- **THEN** the page scrolls to that section with its heading visible below the sticky header

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

### Requirement: The home page makes only true claims

Every claim on the home page SHALL describe behaviour the product actually has at the time, for example 5 to 8 slides, an independent quality review, an image per slide, and a link to every deck. Statements about who can see a deck SHALL match the current access rules. The page SHALL NOT show invented user counts, customer logos, testimonials, ratings or pricing.

#### Scenario: Proof without invention

- **WHEN** the home page renders
- **THEN** it contains no user counts, company logos, testimonials, star ratings or prices

### Requirement: The example is a real sample deck

The Example section and the hero preview SHALL show slides from a fixed sample deck with the same structure the generator produces: a title, slide titles and slide content. Rendering them SHALL NOT call the generator or any external service.

#### Scenario: Example section

- **WHEN** the home page renders
- **THEN** the Example section shows the sample deck's title and its slides in order, each with a title and content

#### Scenario: No generation on view

- **WHEN** the home page is requested
- **THEN** no model call, database query or remote image request is made to render it

### Requirement: The FAQ works without scripts

The FAQ SHALL answer at least four common questions: what the visitor gets, how long generation takes, who can see a deck, and what makes a good idea. Each answer SHALL open and close with a native disclosure control that works without JavaScript and with the keyboard.

#### Scenario: Opening an answer

- **WHEN** a visitor activates a question
- **THEN** its answer is shown, and activating the question again hides it

#### Scenario: Without JavaScript

- **WHEN** the home page is used with JavaScript disabled
- **THEN** the FAQ questions still open and close

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
