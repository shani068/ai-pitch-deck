# Spec Delta

## Purpose

Defines the shared UI foundation every screen builds on: one set of design tokens, consistent typography, and colour-scheme behaviour that components can rely on.

## ADDED Requirements

### Requirement: Shared design tokens

The app SHALL expose one shared set of semantic design tokens (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart, sidebar, radius) usable from utility classes, so components never hard-code colours for these roles.

#### Scenario: Token utilities resolve

- **WHEN** an element uses a semantic token utility such as `bg-primary` or `text-muted-foreground`
- **THEN** it renders with that token's value for the active colour scheme

#### Scenario: Base surfaces use tokens

- **WHEN** any page renders
- **THEN** the document background and text colour come from the `background` and `foreground` tokens

### Requirement: Dark mode follows the operating system

The app SHALL switch its colour tokens and `dark:` variants according to the user's OS or browser colour-scheme preference, without requiring a class, script or theme toggle.

#### Scenario: Dark preference

- **WHEN** the browser reports `prefers-color-scheme: dark`
- **THEN** dark token values and `dark:` utilities are applied

#### Scenario: Light preference

- **WHEN** the browser reports `prefers-color-scheme: light`
- **THEN** light token values apply and `dark:` utilities do not

### Requirement: Geist typography

The app SHALL render body text in Geist Sans and monospace text in Geist Mono, both self-hosted through the framework's font optimisation.

#### Scenario: Default text font

- **WHEN** a page renders text without an explicit font utility
- **THEN** the computed font family begins with Geist Sans

#### Scenario: Monospace text

- **WHEN** an element uses the `font-mono` utility
- **THEN** the computed font family begins with Geist Mono

### Requirement: Component registry configuration

The project SHALL be configured so that UI components can be added from the shadcn/ui registry into a single shared components location and use the shared design tokens without additional setup.

#### Scenario: Adding a component

- **WHEN** a developer adds a registry component (for example `button`)
- **THEN** it is written under the shared UI components directory, imports the shared class-merging utility, and builds without configuration changes
