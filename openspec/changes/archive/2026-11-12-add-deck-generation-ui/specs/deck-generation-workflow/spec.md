# Spec Delta

## ADDED Requirements

### Requirement: Generation runs are limited and excess runs wait

Across all decks, the system SHALL limit how many generation runs execute at the same time and
how many start per hour. A run over either limit SHALL wait and start later. It SHALL NOT be
dropped, and its deck SHALL stay `PENDING` until it starts.

#### Scenario: More requests than the concurrency limit

- **WHEN** more decks request generation at once than the concurrency limit allows
- **THEN** only up to the limit are generated at the same time
- **AND** the others stay `PENDING` and are generated when a run finishes

#### Scenario: Hourly limit reached

- **WHEN** generation is requested after the hourly limit has been reached
- **THEN** the run is delayed until the limit allows it and is then generated
- **AND** no request is discarded because of the limit
