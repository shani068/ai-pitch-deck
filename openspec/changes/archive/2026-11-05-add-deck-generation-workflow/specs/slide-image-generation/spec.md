## ADDED Requirements

### Requirement: Slide images are generated and hosted by default

When placeholder mode is off, the system SHALL turn a slide's image prompt into an image with
OpenAI's image model, upload that image to ImageKit, and return the uploaded image's URL. The
returned URL SHALL be an `https` URL.

#### Scenario: Image is generated and uploaded

- **WHEN** an image is requested for a slide while placeholder mode is off
- **THEN** the slide's image prompt is sent to the image model
- **AND** the generated image is uploaded to ImageKit
- **AND** the ImageKit URL of the uploaded image is returned

#### Scenario: Image model fails

- **WHEN** the image model or the upload fails for a slide
- **THEN** no URL is returned for that slide and the failure is reported to the caller
- **AND** the reported error does not contain API keys

### Requirement: Uploaded images have a deterministic name per slide

Each uploaded image SHALL be stored under a name derived only from its deck and slide position, and
uploading again for the same deck and position SHALL replace the stored file rather than create a
second one.

#### Scenario: Upload is repeated after a retry

- **WHEN** the image for the same deck and slide position is uploaded twice
- **THEN** ImageKit holds one file for that slide, containing the most recent image

### Requirement: Placeholder mode serves Picsum images without external generation

When placeholder mode is on, the system SHALL return a Picsum placeholder image URL for each slide
and SHALL NOT call OpenAI or ImageKit. The placeholder URL SHALL be derived only from the deck and
slide position, so the same slide always gets the same image.

#### Scenario: Placeholder image is returned

- **WHEN** an image is requested for a slide while placeholder mode is on
- **THEN** an `https://picsum.photos/` URL is returned
- **AND** neither the image model nor ImageKit is called

#### Scenario: Placeholder is stable across retries

- **WHEN** an image is requested twice for the same deck and slide position in placeholder mode
- **THEN** both requests return the same URL

#### Scenario: Different slides get different placeholders

- **WHEN** images are requested for two different slide positions of a deck in placeholder mode
- **THEN** the two URLs differ

#### Scenario: Placeholder mode without image credentials

- **WHEN** placeholder mode is on and the OpenAI or ImageKit keys are not configured
- **THEN** images are still returned

### Requirement: Image mode is configured by an environment variable

The image mode SHALL be selected by the `USE_PLACEHOLDER_IMAGES` environment variable, validated
on the server. `"true"` SHALL select placeholder mode and `"false"` SHALL select generated images.
An unset variable SHALL select placeholder mode. Any other value SHALL be rejected with an error
that names the variable and the accepted values, and no image SHALL be generated.

#### Scenario: Variable is unset

- **WHEN** `USE_PLACEHOLDER_IMAGES` is not set
- **THEN** placeholder mode is used

#### Scenario: Generated images are selected

- **WHEN** `USE_PLACEHOLDER_IMAGES` is `"false"`
- **THEN** images are generated and uploaded

#### Scenario: Invalid value

- **WHEN** `USE_PLACEHOLDER_IMAGES` is set to a value other than `"true"` or `"false"`
- **THEN** image requests fail with an error naming the variable and its accepted values
- **AND** no image model or ImageKit call is made

### Requirement: Image generation runs only on the server

Image generation, uploading and the image credentials SHALL be available only to server-side code.

#### Scenario: Client bundle

- **WHEN** the application is built
- **THEN** no client bundle contains the image generation or upload code, the OpenAI API key or
  the ImageKit private key
