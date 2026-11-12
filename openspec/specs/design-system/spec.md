# design-system Specification

## Purpose

Defines the shared UI foundation every screen builds on: one set of design tokens, consistent typography, and colour-scheme behaviour that components can rely on.

## Requirements

### Requirement: Shared design tokens

The app SHALL expose one shared set of semantic design tokens (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart, sidebar, radius) usable from utility classes, so components never hard-code colours for these roles.

#### Scenario: Token utilities resolve

- **WHEN** an element uses a semantic token utility such as `bg-primary` or `text-muted-foreground`
- **THEN** it renders with that token's value for the active colour scheme

#### Scenario: Base surfaces use tokens

- **WHEN** any page renders
- **THEN** the document background and text colour come from the `background` and `foreground` tokens

### Requirement: Inter typography

The app SHALL render all text, including headings and body text, in Inter, self-hosted through the framework's font optimisation, so no font is loaded from another origin at runtime. Monospace text SHALL use the platform's system monospace font, so no monospace web font is downloaded.

#### Scenario: Body and headings

- **WHEN** a page renders body text and headings without an explicit font utility
- **THEN** the computed font family of both begins with Inter

#### Scenario: Monospace text

- **WHEN** an element uses the `font-mono` utility
- **THEN** it renders in a system monospace font and no extra font file is requested

#### Scenario: Fonts are self-hosted

- **WHEN** a page loads
- **THEN** every font file is requested from the app's own origin

### Requirement: Component registry configuration

The project SHALL be configured so that UI components can be added from the shadcn/ui registry into a single shared components location and use the shared design tokens without additional setup.

#### Scenario: Adding a component

- **WHEN** a developer adds a registry component (for example `button`)
- **THEN** it is written under the shared UI components directory, imports the shared class-merging utility, and builds without configuration changes

### Requirement: Colour scheme follows the visitor's choice, defaulting to the OS

The app SHALL offer Light, Dark and System colour schemes. With no saved choice, or with System chosen, it SHALL follow the OS or browser preference and SHALL track changes to that preference while open. A chosen scheme SHALL be remembered in that browser and applied before the first paint of every page, so the wrong scheme never flashes.

#### Scenario: First visit with a dark OS

- **WHEN** a visitor with no saved choice opens any page while their OS prefers dark
- **THEN** the page renders with the dark token values from its first paint

#### Scenario: First visit with a light OS

- **WHEN** a visitor with no saved choice opens any page while their OS prefers light
- **THEN** the page renders with the light token values

#### Scenario: Choosing a scheme

- **WHEN** a visitor chooses Dark while their OS prefers light
- **THEN** the page switches to the dark token values at once
- **AND** later visits and reloads open in dark without first showing light

#### Scenario: Back to System

- **WHEN** a visitor who chose Dark chooses System while their OS prefers light
- **THEN** the page switches to light and no longer keeps a fixed choice

#### Scenario: OS changes while following the system

- **WHEN** the OS preference changes while a page is open and no fixed scheme is chosen
- **THEN** the page switches to the matching scheme without a reload

#### Scenario: Storage unavailable

- **WHEN** the browser blocks or clears site storage
- **THEN** the page follows the OS preference and the theme menu still switches the current page

### Requirement: Interactive elements share consistent states

Every clickable element (buttons, links, menu items, summary toggles and button-like controls) SHALL show a pointer cursor when enabled. Buttons, links and form fields SHALL share consistent hover, keyboard focus-visible, active and disabled styles in both colour schemes. Focus SHALL always be visibly indicated.

#### Scenario: Pointer cursor

- **WHEN** the pointer hovers any enabled button, link, menu item or summary toggle
- **THEN** the cursor is a pointer

#### Scenario: Disabled control

- **WHEN** a button is disabled
- **THEN** it looks disabled, does not react to hover or clicks, and shows no pointer cursor

#### Scenario: Keyboard focus

- **WHEN** a visitor moves focus to any interactive element with the keyboard
- **THEN** a visible focus ring with sufficient contrast is shown in both colour schemes

### Requirement: One icon library

The app SHALL draw every icon from Pikaicons. It SHALL NOT use another icon library, emoji or Unicode symbols as icons. Decorative icons SHALL be hidden from assistive technology, and icon-only controls SHALL have an accessible name.

#### Scenario: Icons across the app

- **WHEN** any page renders an icon
- **THEN** the icon is a Pikaicons component

#### Scenario: Icon-only control

- **WHEN** a control shows only an icon, such as the theme menu trigger
- **THEN** it has an accessible name that describes its action

### Requirement: Text and surfaces meet contrast targets

In both colour schemes, body text and its background SHALL have a contrast ratio of at least 4.5:1, and large headings, icons and focus indicators at least 3:1. This SHALL hold for each foreground/background token pair used for text.

#### Scenario: Muted text

- **WHEN** muted secondary text is shown on the page background or on a card
- **THEN** its contrast ratio is at least 4.5:1 in light and in dark

#### Scenario: Primary button

- **WHEN** a primary button shows its label
- **THEN** the label and the button fill have a contrast ratio of at least 4.5:1 in light and in dark
