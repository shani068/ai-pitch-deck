# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Geist typography

The app SHALL render body text in Geist Sans and monospace text in Geist Mono, and SHALL render page and section headings in the display face Outfit. All three fonts SHALL be self-hosted through the framework's font optimisation, so no font is loaded from another origin at runtime.

#### Scenario: Default text font

- **WHEN** a page renders text without an explicit font utility
- **THEN** the computed font family begins with Geist Sans

#### Scenario: Monospace text

- **WHEN** an element uses the `font-mono` utility
- **THEN** the computed font family begins with Geist Mono

#### Scenario: Headings

- **WHEN** a page renders its main heading or a section heading
- **THEN** the computed font family begins with Outfit

#### Scenario: Fonts are self-hosted

- **WHEN** a page loads
- **THEN** every font file is requested from the app's own origin

## REMOVED Requirements

### Requirement: Dark mode follows the operating system

**Reason**: Visitors can now choose Light, Dark or System. Following the OS is the default behaviour, but no longer the only behaviour, and switching now works by a class instead of only the media query.

**Migration**: Replaced by "Colour scheme follows the visitor's choice, defaulting to the OS". `dark:` utilities keep working. Components need no change, because the `dark` variant now matches the class the theme script sets.
