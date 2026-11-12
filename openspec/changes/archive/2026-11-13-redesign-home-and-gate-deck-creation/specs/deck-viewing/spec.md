# Spec Delta

## MODIFIED Requirements

### Requirement: A failed deck explains the failure and offers to try again

A `FAILED` deck's page SHALL show its user-facing error message, or a generic message when it has
none, and SHALL offer to try again. Trying again SHALL require a valid session, checked on the
server, and SHALL create a new deck from the failed deck's stored idea, start its generation and
take the visitor to the new deck's page. The failed deck SHALL stay unchanged.

#### Scenario: Failure message

- **WHEN** a `FAILED` deck's page is opened
- **THEN** its error message is shown
- **AND** a "try again" action and a "Start over" link to `/new` are shown

#### Scenario: Trying again

- **WHEN** a signed-in person chooses "try again" on a `FAILED` deck
- **THEN** a new `PENDING` deck with the same idea is created and its generation is requested
- **AND** the person is taken to the new deck's page
- **AND** the failed deck keeps its status and error message

#### Scenario: Trying again while signed out

- **WHEN** a "try again" request reaches the server without a valid session
- **THEN** no new deck is created and no generation is requested
- **AND** the page says "Please sign in to create a pitch deck."

#### Scenario: Retry for a deck that has not failed

- **WHEN** a "try again" request reaches the server for a deck that is not `FAILED`, or that does
  not exist
- **THEN** no new deck is created and no generation is requested

#### Scenario: Retry cannot start

- **WHEN** the new deck cannot be created or its generation cannot be requested
- **THEN** the visitor stays on the failed deck's page and sees a generic "please try again" message
- **AND** no deck created by that attempt remains in `PENDING`
