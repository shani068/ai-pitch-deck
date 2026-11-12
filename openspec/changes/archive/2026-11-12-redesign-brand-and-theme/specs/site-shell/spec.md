# Spec Delta

## Purpose

Defines the frame every page shares: the brand mark, the header with its navigation, theme menu and main call to action, the small-screen menu and the footer, so every route feels like one product.

## ADDED Requirements

### Requirement: The brand appears consistently

The app SHALL use one original logo, made of a mark and the "AI Pitch Deck" wordmark, in the header, the footer and the not-found page. The browser tab icon SHALL use the same mark. The logo SHALL take its colours from the design tokens, so it stays legible in both colour schemes.

#### Scenario: Header logo

- **WHEN** any page renders
- **THEN** the header shows the logo, and the logo links to the home page with an accessible name of "AI Pitch Deck home"

#### Scenario: Both colour schemes

- **WHEN** the colour scheme switches between light and dark
- **THEN** the logo's mark and wordmark remain clearly visible against the header background

#### Scenario: Tab icon

- **WHEN** a page is open in a browser tab
- **THEN** the tab shows the brand mark, not the framework's default icon

### Requirement: Every page shares the header

Every page SHALL show a header that stays visible when scrolling. It SHALL contain the logo, links to the home page's How it works, Features and Example sections, the theme menu, and a primary "Create a deck" action that takes the visitor to the idea form. Each control SHALL be reachable and usable with the keyboard.

#### Scenario: Header on any route

- **WHEN** the home page, a deck page or the not-found page renders
- **THEN** the same header with the logo, section links, theme menu and "Create a deck" action is shown

#### Scenario: Create a deck from another page

- **WHEN** a visitor on a deck page chooses "Create a deck"
- **THEN** they reach the home page with focus in the idea field

#### Scenario: Scrolling

- **WHEN** a visitor scrolls down a long page
- **THEN** the header stays at the top of the viewport without covering the focused element

### Requirement: Navigation collapses on small screens

Below the medium breakpoint, the section links SHALL move into a menu opened from a labelled button in the header, and the page SHALL NOT scroll horizontally at 375 px width. The logo, theme menu and "Create a deck" action SHALL stay reachable.

#### Scenario: Phone width

- **WHEN** a page is viewed 375 px wide
- **THEN** the section links are inside a menu opened by a button named "Open menu"
- **AND** the page has no horizontal scroll

#### Scenario: Using the menu

- **WHEN** a visitor opens the menu and chooses a section link
- **THEN** the menu closes and the page scrolls to that section

### Requirement: The theme menu is available on every page

The header SHALL contain a theme menu offering Light, Dark and System, which shows the current choice. Its trigger SHALL have an accessible name, and the menu SHALL work with the keyboard.

#### Scenario: Opening the menu

- **WHEN** a visitor activates the theme trigger, named "Change theme"
- **THEN** a menu with Light, Dark and System opens, and the current choice is marked

#### Scenario: Keyboard use

- **WHEN** a visitor opens the menu with the keyboard and picks an option with the arrow and Enter keys
- **THEN** the scheme changes and focus returns to the trigger

### Requirement: Every page shares the footer

Every page SHALL end with a footer containing the logo, a one-line description of the product, links to the home page sections, and a copyright line.

#### Scenario: Footer on any route

- **WHEN** the home page or a deck page renders
- **THEN** the footer with logo, description, section links and copyright is shown at the bottom
