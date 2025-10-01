## ADDED Requirements

### Requirement: Terminal Commands Table Schema

The terminal_commands table SHALL store command definitions, aliases, and
response templates that power the interactive terminal interface.

#### Scenario: Store command with response template

- **WHEN** a command is inserted into terminal_commands table
- **THEN** record SHALL include command name, description, category, and
  response_template
- **AND** response_template SHALL support template variables and ANSI color
  codes
- **AND** is_active flag SHALL default to true

#### Scenario: Store command aliases

- **WHEN** an alias command is created
- **THEN** alias SHALL be stored as separate row with same response_template as
  original
- **AND** alias SHALL have descriptive name explaining relationship (e.g.,
  "info" aliasing "whoami")
- **AND** both original and alias SHALL return identical output

#### Scenario: Track command metadata

- **WHEN** a command is stored
- **THEN** optional metadata fields (examples, template_variables,
  argument_schema) MAY be populated
- **AND** created_at and updated_at timestamps SHALL be automatically managed
- **AND** permissions field MAY specify access control rules

### Requirement: Command Template Processing

Response templates SHALL support variable substitution, ANSI color codes, and
hyperlinked text formatting.

#### Scenario: Process ANSI color codes in template

- **WHEN** response_template contains ANSI escape sequences
- **THEN** output SHALL apply appropriate color classes during rendering
- **AND** colors SHALL match terminal theme palette

#### Scenario: Support hyperlinks in output

- **WHEN** response_template contains URLs
- **THEN** URLs SHALL be rendered as clickable hyperlinks
- **AND** links SHALL open in new tab with appropriate security attributes
  (rel="noopener noreferrer")

### Requirement: Database Schema Regeneration

The system SHALL regenerate Drizzle ORM schema and TypeScript types when
terminal_commands schema changes to maintain type safety.

#### Scenario: Generate schema after migration

- **WHEN** database migration is applied
- **THEN** developer SHALL run `bun run db:generate` to regenerate schema
- **AND** TypeScript types SHALL be updated in server/db/schema.ts
- **AND** type checking SHALL pass without errors
