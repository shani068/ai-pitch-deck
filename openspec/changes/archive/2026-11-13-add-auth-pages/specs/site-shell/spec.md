# Spec Delta

## ADDED Requirements

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
