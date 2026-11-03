# Spec Delta

## Purpose

Defines how the application stores and reads its data in PostgreSQL: one data contract is the source of truth for the database structure and query types, database access stays on the server, and connections are configured per environment.

## ADDED Requirements

### Requirement: Data contract is the single source of truth

The project SHALL define its data model in one authored data contract. Database structure, query types and initialisation SHALL all derive from that contract, and generated artefacts SHALL never be edited by hand.

#### Scenario: Starter models are declared

- **WHEN** the data contract is read
- **THEN** it declares a `User` model and a `Post` model related to it, and no application-specific models

#### Scenario: Generated artefacts match the contract

- **WHEN** the contract is regenerated after any change to its source
- **THEN** the generated artefacts reflect the source exactly, and application code that references a model or field missing from the contract fails type-checking

### Requirement: Production builds use current contract artefacts

Every production build SHALL regenerate the contract artefacts before compiling, so a build can never compile against artefacts that are out of date with the contract source.

#### Scenario: Build regenerates artefacts

- **WHEN** a production build is started
- **THEN** the contract artefacts are regenerated before the application is compiled

#### Scenario: Invalid contract stops the build

- **WHEN** the contract source is invalid and a production build is started
- **THEN** the build fails with the contract error instead of producing an application

### Requirement: Database access is server-only

Database access and database credentials SHALL be available only to server-side code. No client bundle SHALL contain the database client or any connection string.

#### Scenario: Client code cannot import the database client

- **WHEN** a client component imports the database module
- **THEN** the build fails with an error instead of bundling database code for the browser

#### Scenario: Credentials stay out of client output

- **WHEN** the production client bundles are searched for the database host or password
- **THEN** neither appears

### Requirement: Connection strings come from the environment

Database connection strings SHALL be read from environment variables and never committed. The running app and the schema and migration commands SHALL connect through Neon's direct (unpooled) endpoint, because Neon's PgBouncer pooler rejects the session startup settings the data layer sends. Connection pooling is done inside the server process.

#### Scenario: Secrets are not committed

- **WHEN** the repository contents are inspected
- **THEN** only an example environment file with placeholder values is present, and the real environment file is ignored by version control

#### Scenario: Missing connection string

- **WHEN** the app executes a database query without a connection string configured
- **THEN** the query fails with a connection configuration error, and the error output does not contain any credential

#### Scenario: Direct endpoint from a pooled connection string

- **WHEN** the configured connection string points at Neon's pooled endpoint and either a schema command runs or the app serves a request
- **THEN** both connect to the matching direct endpoint of the same database, and neither goes through the pooler

#### Scenario: Explicit direct connection string

- **WHEN** a separate direct connection string is configured
- **THEN** both the schema commands and the app use it as given

### Requirement: Database is initialised from the contract

A new, empty database SHALL be brought to the contract's structure by an initialisation command that also records which contract the database matches. Initialising or fixing a database SHALL never reset or drop it.

#### Scenario: Initialise an empty database

- **WHEN** the initialisation command runs against an empty database
- **THEN** the tables for every contract model exist and the database records the current contract as applied

#### Scenario: Database matches the contract

- **WHEN** the database is verified against the contract right after initialisation
- **THEN** verification reports no drift

#### Scenario: Re-running initialisation

- **WHEN** the initialisation command runs again with no contract change
- **THEN** it applies no further changes and leaves existing data intact

### Requirement: Pages read data without breaking static rendering

A page that reads from the database SHALL do so at request time inside a streamed boundary. The rest of the page SHALL still be prerendered, and a production build SHALL NOT need a database connection.

#### Scenario: Build without database access

- **WHEN** a production build runs
- **THEN** it completes without querying the database

#### Scenario: Request renders live data

- **WHEN** the home page is requested after rows exist in the database
- **THEN** the page displays data read from the database during that request

#### Scenario: Database unavailable at request time

- **WHEN** the home page is requested while the database is unreachable
- **THEN** the static parts of the page still render, and the data section shows a generic failure message without connection details

### Requirement: One connection pool per server process

The app SHALL reuse a single database client and connection pool per server process, including across development hot reloads, so repeated reloads do not leave orphaned connections open.

#### Scenario: Hot reload in development

- **WHEN** the database module is edited and reloaded several times during development and the page is requested after each reload
- **THEN** the number of open database connections from the app does not grow with each reload
