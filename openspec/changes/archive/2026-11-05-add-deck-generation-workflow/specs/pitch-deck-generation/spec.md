## MODIFIED Requirements

### Requirement: Evaluation fails closed

If quality evaluation cannot complete, the system SHALL block the deck rather than return an
unevaluated one. A deck blocked because evaluation could not complete SHALL produce an
evaluation-failed error, which is distinct from the quality-rejected error produced when the
evaluator judges the deck and does not approve it, so callers can retry the first and not the
second.

#### Scenario: Evaluator call fails

- **WHEN** the evaluator's model call fails or returns no verdict
- **THEN** the deck is not returned and the caller receives an evaluation-failed error
- **AND** the error message is a generic retry message without the provider's raw error text

#### Scenario: Original idea is unavailable to the evaluator

- **WHEN** the evaluation step cannot access the original business idea
- **THEN** the deck is not returned and the caller receives an evaluation-failed error

#### Scenario: Evaluator completes and rejects

- **WHEN** the evaluator returns a verdict that does not approve the deck
- **THEN** the caller receives a quality-rejected error, not an evaluation-failed error

### Requirement: Failures produce typed, safe errors

Every failed generation SHALL raise one error type that carries a code callers can branch on:
input rejected, quality rejected, evaluation failed, invalid output, or generation failed. Error
messages SHALL be safe to show users and SHALL NOT include API keys, raw provider error text, or
raw model output.

#### Scenario: Caller distinguishes failure kinds

- **WHEN** generation fails for any reason
- **THEN** the caller receives an error with exactly one of the five codes

#### Scenario: Unexpected provider failure

- **WHEN** the model provider returns an error or the run fails unexpectedly
- **THEN** the caller receives a generation-failed error with a generic message
- **AND** the provider's raw error text is not included in the message
