# Spec Delta

## Purpose

Defines the home page as the product's front door: it explains what AI Pitch Deck does, shows a real example of its output, lets the visitor start a deck immediately, and makes only claims the product can back up.

## ADDED Requirements

### Requirement: The home page is ordered as a product landing page

The home page SHALL present, in this order:

- a hero;
- a strip of product facts;
- a How it works section;
- a Features section;
- an Example section;
- an FAQ;
- a closing call to action.

The How it works, Features and Example sections SHALL be reachable by in-page links.

#### Scenario: Section order

- **WHEN** the home page renders
- **THEN** its sections appear in this order: hero, facts, How it works, Features, Example, FAQ, closing call to action

#### Scenario: In-page links

- **WHEN** a visitor follows a link to `/#how-it-works`, `/#features` or `/#example`
- **THEN** the page scrolls to that section with its heading visible below the sticky header

### Requirement: The hero starts a deck

The hero SHALL show a headline, one supporting sentence, the idea form and a preview of a sample slide. The idea form SHALL keep its existing validation and submission behaviour. On narrow screens, the form SHALL come before the preview.

#### Scenario: Starting from the hero

- **WHEN** a visitor submits a valid idea from the hero
- **THEN** a deck is created and they are taken to its page, as before this change

#### Scenario: Narrow screen

- **WHEN** the home page is viewed 375 px wide
- **THEN** the headline and idea form appear before the slide preview, and nothing scrolls horizontally

#### Scenario: Closing call to action

- **WHEN** a visitor chooses the closing call to action
- **THEN** focus moves to the idea field in the hero

### Requirement: The home page makes only true claims

Every claim on the home page SHALL describe behaviour the product actually has at the time, for example 5 to 8 slides, an independent quality review, an image per slide, and a link to every deck. Statements about who can see a deck SHALL match the current access rules. The page SHALL NOT show invented user counts, customer logos, testimonials, ratings or pricing.

#### Scenario: Proof without invention

- **WHEN** the home page renders
- **THEN** it contains no user counts, company logos, testimonials, star ratings or prices

### Requirement: The example is a real sample deck

The Example section and the hero preview SHALL show slides from a fixed sample deck with the same structure the generator produces: a title, slide titles and slide content. Rendering them SHALL NOT call the generator or any external service.

#### Scenario: Example section

- **WHEN** the home page renders
- **THEN** the Example section shows the sample deck's title and its slides in order, each with a title and content

#### Scenario: No generation on view

- **WHEN** the home page is requested
- **THEN** no model call, database query or remote image request is made to render it

### Requirement: The design stays restrained

The home page SHALL NOT use animated or decorative backgrounds (beams, spotlights, glows, aurora, particles or meteors), gradient fills, 3D or tilt effects, parallax, marquees or scroll-triggered animation. Interaction feedback SHALL be limited to short state transitions, which SHALL be turned off when the visitor asks for reduced motion.

#### Scenario: Reduced motion

- **WHEN** a visitor's system requests reduced motion
- **THEN** hover and focus changes happen without transitions

#### Scenario: No decorative effects

- **WHEN** the home page renders
- **THEN** no element uses a gradient fill, an animated background or a 3D transform

### Requirement: The FAQ works without scripts

The FAQ SHALL answer at least four common questions: what the visitor gets, how long generation takes, who can see a deck, and what makes a good idea. Each answer SHALL open and close with a native disclosure control that works without JavaScript and with the keyboard.

#### Scenario: Opening an answer

- **WHEN** a visitor activates a question
- **THEN** its answer is shown, and activating the question again hides it

#### Scenario: Without JavaScript

- **WHEN** the home page is used with JavaScript disabled
- **THEN** the FAQ questions still open and close
