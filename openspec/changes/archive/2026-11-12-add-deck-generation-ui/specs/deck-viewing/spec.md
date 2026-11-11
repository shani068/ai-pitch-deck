# Spec Delta

## Purpose

Gives every deck a public page, reached by its link, that follows the deck's generation from
start to finish and then presents the finished deck, a failure with a way to try again, or a
notice when generation is taking unusually long.

## ADDED Requirements

### Requirement: Each deck has a public page reached by its link

Each deck SHALL have a page at `/decks/<deck id>` that anyone with the link can open without
signing in. The link SHALL be treated as a share link, not as access control.

#### Scenario: Opening a deck link

- **WHEN** anyone opens the link of an existing deck
- **THEN** the deck's page is shown without asking them to sign in

#### Scenario: Unknown deck

- **WHEN** a link is opened whose deck id matches no deck
- **THEN** a "not found" page is shown with a link back to the home page

#### Scenario: Malformed deck id

- **WHEN** a link is opened whose deck id is not a valid deck id
- **THEN** the same "not found" page is shown and the database is not queried

### Requirement: The deck page reveals only generated content

The deck page SHALL show only the deck's status, generated title, slides and its user-facing error
message. It SHALL NOT show the business idea the visitor typed, and it SHALL ask search engines not
to index it.

#### Scenario: Viewing a completed deck

- **WHEN** a completed deck's page is opened
- **THEN** the page does not contain the original business idea text

#### Scenario: Search engines

- **WHEN** a search engine reads any deck page
- **THEN** the page tells it not to index the page

### Requirement: The page shows progress while the deck is generated

While the deck is `PENDING` or `GENERATING`, the page SHALL show which of the two it is, and SHALL
update by itself within 10 seconds of the status changing, without the visitor reloading. Progress
SHALL be announced to assistive technology.

#### Scenario: Waiting to start

- **WHEN** the deck is `PENDING`
- **THEN** the page shows that the deck is queued to be generated

#### Scenario: Generating

- **WHEN** the deck is `GENERATING`
- **THEN** the page shows that the deck is being generated

#### Scenario: Generation finishes while the page is open

- **WHEN** the deck becomes `COMPLETE` or `FAILED` while its page is open
- **THEN** within 10 seconds the page shows the finished deck or the failure without a reload
- **AND** the page stops checking for updates

### Requirement: A completed deck is shown slide by slide

A `COMPLETE` deck SHALL be shown with its generated title, followed by every slide in order with
its title, content and image. A slide without an image SHALL still show its title and content.
Every image SHALL have a text alternative.

#### Scenario: Completed deck

- **WHEN** a `COMPLETE` deck with six slides is opened
- **THEN** the deck title and six slides are shown in their saved order
- **AND** each slide shows its title, content and image

#### Scenario: Slide without an image

- **WHEN** a slide of a completed deck has no image URL
- **THEN** that slide is shown with its title and content and no broken image

#### Scenario: Images load under the security policy

- **WHEN** a completed deck's images come from the placeholder service or from ImageKit
- **THEN** every image loads without the page's Content-Security-Policy blocking it

### Requirement: A failed deck explains the failure and offers to try again

A `FAILED` deck's page SHALL show its user-facing error message, or a generic message when it has
none, and SHALL offer to try again. Trying again SHALL create a new deck from the failed deck's
stored idea, start its generation and take the visitor to the new deck's page. The failed deck
SHALL stay unchanged.

#### Scenario: Failure message

- **WHEN** a `FAILED` deck's page is opened
- **THEN** its error message is shown
- **AND** a "try again" action and a link to start over from the home page are shown

#### Scenario: Trying again

- **WHEN** the visitor chooses "try again" on a `FAILED` deck
- **THEN** a new `PENDING` deck with the same idea is created and its generation is requested
- **AND** the visitor is taken to the new deck's page
- **AND** the failed deck keeps its status and error message

#### Scenario: Retry for a deck that has not failed

- **WHEN** a "try again" request reaches the server for a deck that is not `FAILED`, or that does
  not exist
- **THEN** no new deck is created and no generation is requested

#### Scenario: Retry cannot start

- **WHEN** the new deck cannot be created or its generation cannot be requested
- **THEN** the visitor stays on the failed deck's page and sees a generic "please try again" message
- **AND** no deck created by that attempt remains in `PENDING`

### Requirement: Unusually slow generation is reported

When a deck is still `PENDING` or `GENERATING` 10 minutes after it was created, the page SHALL
stop checking for updates by itself, tell the visitor that generation is taking longer than
expected, and let them check again on demand. This SHALL hold even after a reload.

#### Scenario: Deck stuck in pending

- **WHEN** a deck created more than 10 minutes ago is still `PENDING` and its page is opened
- **THEN** the page says generation is taking longer than expected
- **AND** the page does not keep checking for updates by itself
- **AND** a "check again" action reloads the deck's current status

#### Scenario: Deck finishes after the notice

- **WHEN** the deck has become `COMPLETE` and the visitor chooses "check again"
- **THEN** the completed deck is shown
