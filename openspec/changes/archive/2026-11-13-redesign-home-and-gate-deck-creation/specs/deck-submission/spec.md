# Spec Delta

## ADDED Requirements

### Requirement: Signed-in people submit ideas on a dedicated page

The page `/new` SHALL offer the business idea form to signed-in people only, with the idea field focused when the form appears. A visitor without a valid session SHALL be sent to sign in and brought back to `/new` afterwards. The home page SHALL NOT contain the form.

#### Scenario: Signed-in person opens /new

- **WHEN** a signed-in person opens `/new`
- **THEN** the idea form is shown and the idea field has focus

#### Scenario: Signed-out visitor opens /new

- **WHEN** a visitor without a session cookie opens `/new`
- **THEN** they are redirected to `/sign-in?next=/new`
- **AND** after signing in they land on `/new`

#### Scenario: Stale session

- **WHEN** a visitor whose session cookie no longer matches a session opens `/new`
- **THEN** the form is not shown and they reach the sign-in page, without a redirect loop

### Requirement: Deck creation is authorised on the server

Every idea submission SHALL be checked for a valid session on the server, whatever the browser shows. A submission without one SHALL create no deck, request no generation and return the message "Please sign in to create a pitch deck."

#### Scenario: Submission without a session

- **WHEN** an idea submission reaches the server without a valid session
- **THEN** no deck is created and no generation is requested
- **AND** the response says "Please sign in to create a pitch deck."

## REMOVED Requirements

### Requirement: Visitors can submit a business idea without an account

**Reason**: Deck creation now requires an account, at the product owner's request, to prepare for decks owned by accounts and to limit anonymous use of the generator.

**Migration**: Replaced by "Signed-in people submit ideas on a dedicated page" and "Deck creation is authorised on the server". Every "Create a deck" action now leads to `/new`.
