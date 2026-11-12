# site-shell Specification

## Purpose

Defines the frame every page shares: the brand mark, the header with its navigation, theme menu and main call to action, the small-screen menu and the footer, so every route feels like one product.

## Requirements

### Requirement: The brand appears consistently

The app SHALL use one original logo, made of a mark and the "AI Pitch Deck" wordmark, in the footer and the not-found page. The header SHALL show the wordmark alone. The browser tab icon SHALL use the same mark. The logo and wordmark SHALL take their colours from the design tokens, so they stay legible in both colour schemes.

#### Scenario: Header logo

- **WHEN** any page renders
- **THEN** the header shows the "AI Pitch Deck" wordmark without the mark, and it links to the home page with an accessible name of "AI Pitch Deck home"

#### Scenario: Both colour schemes

- **WHEN** the colour scheme switches between light and dark
- **THEN** the logo's mark and wordmark remain clearly visible against the header background

#### Scenario: Tab icon

- **WHEN** a page is open in a browser tab
- **THEN** the tab shows the brand mark, not the framework's default icon

### Requirement: Every page shares the header

Every page SHALL show a header that stays visible when scrolling. It SHALL contain the logo, links to the home page's How it works, Features and Example sections, the theme menu, and a primary "Create a deck" action that takes the visitor to the idea form at `/new`. Each control SHALL be reachable and usable with the keyboard.

#### Scenario: Header on any route

- **WHEN** the home page, a deck page or the not-found page renders
- **THEN** the same header with the logo, section links, theme menu and "Create a deck" action is shown

#### Scenario: Create a deck from another page

- **WHEN** a signed-in person on a deck page chooses "Create a deck"
- **THEN** they reach `/new` with focus in the idea field

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

### Requirement: The header shows the visitor's account state

The header on every page SHALL show "Sign in", linking to `/sign-in`, when the visitor is signed out. When the visitor is signed in, it SHALL show an account menu whose trigger is named with the person's name. The menu SHALL list their name and email and a "Sign out" action. The mobile menu SHALL offer the same choices. Reading the account state SHALL NOT make the page itself render per request, and SHALL NOT cause a database query when the page is rendered.

#### Scenario: Signed out

- **WHEN** a signed-out visitor views any page
- **THEN** the header shows a "Sign in" link to `/sign-in`

#### Scenario: Signed in

- **WHEN** a signed-in person views any page
- **THEN** the header shows their account menu instead of "Sign in"
- **AND** opening it shows their name, their email and "Sign out"

#### Scenario: While the state loads

- **WHEN** a page has loaded but the account state is still being read
- **THEN** the header reserves the space for the account control, so nothing shifts when it appears

#### Scenario: Home page stays static

- **WHEN** the app is built for production
- **THEN** the home page is still listed as static

### Requirement: The header becomes a floating bar once the page scrolls

At the top of a page, the header bar SHALL have no background of its own, so it blends into the page. Once the page has scrolled, a rounded, blurred bar SHALL fade in behind the header's content, and it SHALL fade out again at the top. Section links SHALL show a soft background when hovered. Every one of these changes SHALL be a smooth transition.

#### Scenario: At the top of the page

- **WHEN** a page is opened at its top
- **THEN** the header has no bar background or border

#### Scenario: After scrolling

- **WHEN** the visitor scrolls down
- **THEN** a rounded bar with a border, shadow and blurred background fades in behind the header

#### Scenario: Back at the top

- **WHEN** the visitor scrolls back to the top
- **THEN** the bar fades out again

#### Scenario: Hovering a section link

- **WHEN** a pointer moves onto a section link
- **THEN** a soft rounded background fades in behind it
