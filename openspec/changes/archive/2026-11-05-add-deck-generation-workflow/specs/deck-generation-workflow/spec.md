## ADDED Requirements

### Requirement: A deck/generate event starts background generation of one deck

The system SHALL generate a deck in the background when it receives a `deck/generate` event whose
data contains the id of an existing deck. The event's deck id SHALL be validated on receipt, and
generation SHALL use the business idea stored on that deck.

#### Scenario: Event for an existing pending deck

- **WHEN** a `deck/generate` event arrives for a deck in `PENDING` status
- **THEN** a pitch deck is generated from that deck's stored business idea

#### Scenario: Event for a deck that does not exist

- **WHEN** a `deck/generate` event arrives with a deck id that matches no deck
- **THEN** the run fails without retrying and no deck or slide is written

#### Scenario: Event with a malformed deck id

- **WHEN** a `deck/generate` event arrives whose deck id is missing or not a valid id
- **THEN** the run fails without retrying and nothing is written to the database

#### Scenario: Event for a deck that is already complete

- **WHEN** a `deck/generate` event arrives for a deck in `COMPLETE` status
- **THEN** the run ends successfully without generating content, images or slides
- **AND** the deck's existing title and slides are unchanged

### Requirement: Deck status reflects generation progress

A deck SHALL move to `GENERATING` before content generation starts, and SHALL move to `COMPLETE`
only once its title and all of its slides are saved. Moving to `GENERATING` SHALL clear any error
message left from an earlier failed run.

#### Scenario: Generation starts

- **WHEN** generation starts for a deck
- **THEN** the deck's status is `GENERATING` and its error message is empty

#### Scenario: Generation succeeds

- **WHEN** the content and every slide image have been generated
- **THEN** the deck's title is the generated deck title
- **AND** the deck has one slide per generated slide, each with its title, content, image prompt,
  image URL and zero-based position in generated order
- **AND** the deck's status is `COMPLETE`

#### Scenario: Readers never see a partly saved deck

- **WHEN** the deck is read at any moment while generation is saving its results
- **THEN** either no generated slides and no generated title are visible, or all of them are
  visible with status `COMPLETE`

### Requirement: Retries never duplicate slides

Saving a deck's results SHALL replace any slides the deck already has, so that a deck ends with
exactly one slide per generated slide however many times the save is attempted.

#### Scenario: Save is retried

- **WHEN** saving the slides is attempted more than once for the same run
- **THEN** the deck has exactly as many slides as the generated deck, with no duplicate positions

#### Scenario: Deck is regenerated after a failure

- **WHEN** a deck that already has slides from an earlier attempt is generated again, for example by
  an Inngest replay or after the idempotency window
- **THEN** only the slides from the new generation remain

### Requirement: Transient failures are retried; completed work is not repeated

A failure caused by a temporary condition (a provider or network error, a rate limit, a temporary
evaluator failure, a database error) SHALL be retried automatically. When a later part of the run
is retried, parts that already succeeded SHALL NOT run again: the deck content SHALL NOT be
regenerated, and images that were already produced SHALL NOT be produced again.

#### Scenario: An image fails temporarily

- **WHEN** generating the image for one slide fails with a temporary error and then succeeds on
  retry
- **THEN** the deck completes
- **AND** the deck content and the other slides' images are not generated again

#### Scenario: Saving fails temporarily

- **WHEN** saving the results fails with a temporary database error and then succeeds on retry
- **THEN** the deck completes with the content and images from before the failure

#### Scenario: Evaluator fails temporarily

- **WHEN** content generation fails because the quality evaluator could not complete
- **THEN** content generation is retried

### Requirement: Rejections are not retried

A failure that cannot succeed by retrying SHALL fail the run at once. This includes an idea the
input check rejects and a deck the evaluator does not approve.

#### Scenario: Idea is rejected

- **WHEN** content generation rejects the deck's business idea
- **THEN** the run fails without retrying

#### Scenario: Evaluator rejects the deck

- **WHEN** the evaluator does not approve the generated deck
- **THEN** the run fails without retrying and no slides are saved

### Requirement: A deck that cannot be generated is marked failed with a safe message

When a run fails without retrying, or has used all its retries, the deck SHALL be marked `FAILED`
with an error message. A deck SHALL NOT be marked `FAILED` while a retry is still pending. The
message SHALL be safe to show users: for a rejection it SHALL explain the rejection, and for any
other failure it SHALL be a generic message. It SHALL NOT contain API keys, raw provider or
database error text, or stack traces.

#### Scenario: Retry pending

- **WHEN** a part of the run fails with a temporary error and a retry is still pending
- **THEN** the deck's status stays `GENERATING`

#### Scenario: Retries exhausted

- **WHEN** a part of the run keeps failing with temporary errors until no retries remain
- **THEN** the deck's status is `FAILED`
- **AND** its error message is a generic "could not be generated" message without provider text

#### Scenario: Rejection message is saved

- **WHEN** the run fails because the idea or the generated deck was rejected
- **THEN** the deck's status is `FAILED`
- **AND** its error message is the user-facing rejection message, including the evaluator's listed
  issues when the evaluator rejected the deck

### Requirement: Duplicate events for the same deck start only one run

Within Inngest's idempotency window of 24 hours, at most one generation run SHALL start per deck
id. A `deck/generate` event for the same deck after that window SHALL start a new run.

#### Scenario: Event is sent twice

- **WHEN** two `deck/generate` events for the same deck arrive within 24 hours
- **THEN** only one generation run starts for that deck
