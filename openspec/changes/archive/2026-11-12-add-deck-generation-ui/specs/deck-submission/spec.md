# Spec Delta

## Purpose

Lets a visitor turn a business idea into a new pitch deck from the web: the idea is validated on
the server, a deck is created, its background generation is started and the visitor is taken to it.

## ADDED Requirements

### Requirement: Visitors can submit a business idea without an account

The home page SHALL offer a form where any visitor, without signing in, can enter a business idea
and submit it to generate a pitch deck.

#### Scenario: Visitor opens the home page

- **WHEN** a visitor opens the home page
- **THEN** a form with a business idea field and a submit button is shown
- **AND** no sign-in is required

### Requirement: Ideas are validated on the server

The server SHALL accept an idea only when, after trimming surrounding whitespace, it is between 20
and 2,000 characters long. A rejected idea SHALL create no deck and start no generation. Checks in
the browser SHALL only improve the experience and SHALL NOT replace the server check.

#### Scenario: Idea too short

- **WHEN** an idea shorter than 20 characters after trimming is submitted
- **THEN** no deck is created and no generation starts
- **AND** the form shows a message asking for at least 20 characters

#### Scenario: Idea too long

- **WHEN** an idea longer than 2,000 characters after trimming is submitted
- **THEN** no deck is created and no generation starts
- **AND** the form shows a message asking to keep the idea under 2,000 characters

#### Scenario: Browser checks are bypassed

- **WHEN** a request reaches the server with a missing, non-text or too-short idea, without going
  through the browser's form checks
- **THEN** the server rejects it, creates no deck and starts no generation

#### Scenario: Surrounding whitespace

- **WHEN** a valid idea with leading or trailing whitespace is submitted
- **THEN** the deck is created with the trimmed idea

### Requirement: A valid idea creates a pending deck and starts its generation

For a valid idea the server SHALL create a deck in `PENDING` status holding the trimmed idea,
start its background generation, and send the visitor to that deck's page.

#### Scenario: Successful submission

- **WHEN** a valid idea is submitted
- **THEN** exactly one new deck exists with status `PENDING` and the trimmed idea
- **AND** background generation is requested for that deck
- **AND** the visitor is taken to that deck's page

### Requirement: A failed start leaves no stranded deck

If generation cannot be requested after the deck was created, the server SHALL NOT leave the deck
in `PENDING`, and the form SHALL show a generic message asking the visitor to try again. The
message SHALL NOT contain provider, database or internal error text.

#### Scenario: Generation request fails

- **WHEN** a valid idea is submitted and the request to start generation fails
- **THEN** the visitor stays on the form and sees a generic "could not start, please try again"
  message
- **AND** no deck created by that submission remains in `PENDING`

#### Scenario: Deck cannot be created

- **WHEN** a valid idea is submitted and the deck cannot be saved
- **THEN** no generation is requested
- **AND** the form shows the same generic message

### Requirement: The form shows progress and keeps the idea on error

While a submission is being processed the submit button SHALL be disabled and show that it is
working, so one click starts at most one deck. When the submission is rejected, the idea the
visitor typed SHALL stay in the field.

#### Scenario: Double click

- **WHEN** a visitor clicks submit twice in quick succession
- **THEN** only one deck is created

#### Scenario: Rejected submission keeps the text

- **WHEN** a submission is rejected because of validation or a failed start
- **THEN** the field still contains the text the visitor entered
- **AND** the error message is associated with the field for assistive technology
