# Spec Delta

## Purpose

Lets a person create an account with email and password, sign in, stay signed in through a secure session, and sign out, so later features can show each person their own data.

## ADDED Requirements

### Requirement: Visitors can create an account with email and password

The sign-up page SHALL create an account from a full name, an email address and a password, and SHALL sign the new person in. The server SHALL accept:

- a name of 1 to 100 characters after trimming;
- a valid email address, stored in lower case;
- a password of 8 to 128 characters.

An email address SHALL belong to at most one account.

#### Scenario: Successful sign-up

- **WHEN** a visitor submits a name, a new email address and an 8-character password
- **THEN** an account is created with the trimmed name and lower-cased email
- **AND** the visitor is signed in and taken to the home page

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
- **THEN** they are signed in and taken to the home page

#### Scenario: Wrong credentials

- **WHEN** a person submits an unknown email, or a known email with the wrong password
- **THEN** they stay on the sign-in page and see "Invalid email or password." in both cases

#### Scenario: Signing out

- **WHEN** a signed-in person chooses "Sign out"
- **THEN** their session is deleted on the server, the session cookie is cleared and the header shows "Sign in"

### Requirement: Sessions are held in a secure cookie

A signed-in session SHALL be identified by a cookie that scripts cannot read. It SHALL be sent only to this site on same-site requests and top-level navigations, and only over HTTPS in production. A session SHALL last 7 days and be extended while it is used. No session token SHALL be stored in browser storage.

#### Scenario: Session cookie flags

- **WHEN** a person signs in on the production site
- **THEN** the session cookie is HttpOnly, Secure and SameSite=Lax

#### Scenario: Returning visit

- **WHEN** a signed-in person comes back within 7 days
- **THEN** they are still signed in

#### Scenario: Nothing in browser storage

- **WHEN** a person signs in
- **THEN** no session token is written to localStorage or sessionStorage

### Requirement: Repeated attempts are rate-limited

The auth endpoints SHALL limit how often one client can try to sign in or sign up within a short window. The counters SHALL be stored in the database so the limit holds across server instances. A limited request SHALL get a clear "too many attempts" message.

#### Scenario: Too many sign-in attempts

- **WHEN** one client sends more sign-in attempts than the limit allows within the window, in production
- **THEN** the extra attempts are refused without checking the password
- **AND** the form says to wait a moment and try again

### Requirement: Auth pages share one layout

The sign-in and sign-up pages SHALL share one layout:

- a centred title and one-line subtitle;
- a card holding the form;
- below the card, a link to the other page;
- a background of faint grid lines with small "+" marks where the lines around the card cross.

The pages SHALL NOT show social sign-in buttons or links to pages that don't exist.

#### Scenario: Sign-up page

- **WHEN** a visitor opens `/sign-up`
- **THEN** they see "Create your account", fields for full name, email address and password (8+ characters), a "Create account" button and "Already have an account? Sign in"

#### Scenario: Sign-in page

- **WHEN** a visitor opens `/sign-in`
- **THEN** they see "Welcome back", fields for email address and password, a "Sign in" button and "Don't have an account? Create one"

#### Scenario: No social sign-in or dead links

- **WHEN** either auth page renders
- **THEN** it contains no GitHub or Google button and no Terms or Privacy Policy link

### Requirement: Auth form controls are accessible and guard against double submits

Every input on the auth pages SHALL have a leading icon and an accessible label. The password field SHALL have a button that shows or hides the password and states its current action. The submit button SHALL show progress and prevent a second submit while a request is in progress.

#### Scenario: Labelled inputs

- **WHEN** a screen reader user moves through an auth form
- **THEN** every input announces its label, such as "Email address"

#### Scenario: Password visibility

- **WHEN** a visitor activates the button named "Show password"
- **THEN** the password is shown as text and the button is renamed "Hide password"

#### Scenario: Submitting

- **WHEN** a visitor submits a form and the request is in progress
- **THEN** the submit button is disabled and shows progress, so a double click sends one request

### Requirement: Signed-in people skip the auth pages

A signed-in person who opens `/sign-in` or `/sign-up` SHALL be redirected to the home page. This redirect SHALL be a convenience only and SHALL NOT be relied on for access control.

#### Scenario: Opening sign-in while signed in

- **WHEN** a signed-in person opens `/sign-in`
- **THEN** they land on the home page
