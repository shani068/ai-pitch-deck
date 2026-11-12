# Spec Delta

## MODIFIED Requirements

### Requirement: Visitors can create an account with email and password

The sign-up page SHALL create an account from a full name, an email address and a password, and SHALL sign the new person in. The server SHALL accept:

- a name of 1 to 100 characters after trimming;
- a valid email address, stored in lower case;
- a password of 8 to 128 characters.

An email address SHALL belong to at most one account.

#### Scenario: Successful sign-up

- **WHEN** a visitor submits a name, a new email address and an 8-character password
- **THEN** an account is created with the trimmed name and lower-cased email
- **AND** the visitor is signed in and taken to the allowlisted page they were sent from, or else to the home page

#### Scenario: Email already registered

- **WHEN** a visitor signs up with an email address that already has an account
- **THEN** no account is created
- **AND** the form says an account with that email already exists and offers the sign-in link

#### Scenario: Weak or invalid input

- **WHEN** a visitor submits a password shorter than 8 characters, an invalid email address or an empty name
- **THEN** no account is created
- **AND** the form shows a message next to the field that needs fixing, and keeps what the visitor typed

#### Scenario: Browser checks bypassed

- **WHEN** a request reaches the server with a name longer than 100 characters, or a password shorter than 8 or longer than 128 characters, without going through the form
- **THEN** the server rejects it and creates no account

### Requirement: Visitors can sign in and sign out

The sign-in page SHALL sign a person in with their email and password. A wrong email or password SHALL produce the same message, so the page never reveals which accounts exist. Signing out SHALL end the session on the server and in the browser.

#### Scenario: Successful sign-in

- **WHEN** a person submits the email and password of their account
- **THEN** they are signed in and taken to the allowlisted page they were sent from, or else to the home page

#### Scenario: Wrong credentials

- **WHEN** a person submits an unknown email, or a known email with the wrong password
- **THEN** they stay on the sign-in page and see "Invalid email or password." in both cases

#### Scenario: Signing out

- **WHEN** a signed-in person chooses "Sign out"
- **THEN** their session is deleted on the server, the session cookie is cleared and the header shows "Sign in"

### Requirement: Signed-in people skip the auth pages

A signed-in person who opens `/sign-in` or `/sign-up` SHALL be redirected to the home page, unless the address carries a `next` value, in which case the page SHALL be shown. This redirect SHALL be a convenience only and SHALL NOT be relied on for access control.

#### Scenario: Opening sign-in while signed in

- **WHEN** a signed-in person opens `/sign-in`
- **THEN** they land on the home page

#### Scenario: Sent to sign in from a protected page

- **WHEN** a person whose session cookie no longer matches a session is sent to `/sign-in?next=/new`
- **THEN** the sign-in page is shown instead of a redirect, so they can sign in again without a loop

## ADDED Requirements

### Requirement: The return path after sign-in is allowlisted

After signing in or up, a person SHALL be sent to the `next` page only when it exactly matches an allowlisted path, currently only `/new`. Any other value SHALL send them to the home page, so the `next` value can never send anyone to another site.

#### Scenario: Allowlisted return

- **WHEN** a person signs in from `/sign-in?next=/new`
- **THEN** they land on `/new`

#### Scenario: Unsafe or unknown return

- **WHEN** a person signs in from a sign-in address whose `next` is `//evil.example`, `https://evil.example/new`, `/new?x=1` or `/decks/abc`
- **THEN** they land on the home page
