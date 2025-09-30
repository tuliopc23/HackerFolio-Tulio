## ADDED Requirements

### Requirement: Unified Color System

The system SHALL provide a consistent color palette across all UI components
with semantic color tokens mapped to specific hex values.

#### Scenario: Cyan color consistency

- **WHEN** any component uses cyan color
- **THEN** it SHALL use `#33b1ff` (brightest cyan) via `var(--cyan-bright)`
  token

#### Scenario: Green color consistency

- **WHEN** any component uses green color (e.g., terminal prompt, success
  states)
- **THEN** it SHALL use `#42be65` via `var(--terminal-green)` token

#### Scenario: Pink/Magenta color consistency

- **WHEN** any component uses pink/magenta colors
- **THEN** it SHALL use `#be95ff` for bright magenta via `var(--magenta-bright)`
  OR `#ff7eb6` for soft magenta via `var(--magenta-soft)`

#### Scenario: User portfolio prompt colors

- **WHEN** the terminal displays `user@portfolio` prompt
- **THEN** the "user@" and ":~$" portions SHALL use `#42be65` (green) AND the
  "portfolio" portion SHALL use `#ff7eb6` (pink)

### Requirement: Typography Hierarchy

The system SHALL implement a consistent typography scale across all terminal
panes that ensures readability and visual harmony.

#### Scenario: Terminal prompt typography

- **WHEN** displaying the terminal prompt
- **THEN** the font size SHALL be enlarged to minimum 0.875rem (14px) for
  improved readability

#### Scenario: Typography boundaries

- **WHEN** rendering text within cards or panes
- **THEN** the text SHALL NOT overflow or break card boundaries AND SHALL use
  appropriate overflow handling (ellipsis, line-clamp, scroll)

#### Scenario: Hierarchical font sizing

- **WHEN** rendering different text elements
- **THEN** headers SHALL use larger sizes than body text AND labels SHALL use
  smaller sizes than body text to create clear visual hierarchy

### Requirement: CSS Custom Properties

The system SHALL use CSS custom properties for all color and typography values
instead of hardcoded values.

#### Scenario: Color token usage

- **WHEN** styling any component
- **THEN** it SHALL reference CSS custom properties (e.g., `var(--cyan-bright)`)
  instead of hex codes directly

#### Scenario: Typography token usage

- **WHEN** setting font sizes
- **THEN** it SHALL prefer CSS custom properties or Tailwind utility classes
  over inline rem values where appropriate
