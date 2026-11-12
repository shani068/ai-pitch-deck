# Spec Delta

## ADDED Requirements

### Requirement: Inter typography

The app SHALL render all text, including headings and body text, in Inter, self-hosted through the framework's font optimisation, so no font is loaded from another origin at runtime. Monospace text SHALL use the platform's system monospace font, so no monospace web font is downloaded.

#### Scenario: Body and headings

- **WHEN** a page renders body text and headings without an explicit font utility
- **THEN** the computed font family of both begins with Inter

#### Scenario: Monospace text

- **WHEN** an element uses the `font-mono` utility
- **THEN** it renders in a system monospace font and no extra font file is requested

#### Scenario: Fonts are self-hosted

- **WHEN** a page loads
- **THEN** every font file is requested from the app's own origin

## REMOVED Requirements

### Requirement: Geist typography

**Reason**: The app moves to a single typeface, Inter, for headings and body text, at the product owner's request.

**Migration**: Replaced by "Inter typography". The `font-sans` and `font-heading` utilities both resolve to Inter, and `font-mono` resolves to the system monospace stack. Components need no change.
