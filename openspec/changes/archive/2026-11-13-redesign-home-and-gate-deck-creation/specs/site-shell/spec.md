# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
