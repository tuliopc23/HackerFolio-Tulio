## ADDED Requirements

### Requirement: Clear Command Restores Welcome State

The terminal clear command and Ctrl+L keyboard shortcut SHALL restore the
terminal to its initial welcome state instead of leaving a blank screen.

#### Scenario: Clear command restores welcome state

- **WHEN** user runs the `clear` command
- **THEN** the terminal history SHALL be cleared
- **AND** the connection initialization message SHALL be displayed
  ("Initializing secure connection..." with checkmark)
- **AND** the ASCII art banner with "Tulio Cunha Developer" SHALL be displayed
- **AND** the "Type help for tutorial" tip message SHALL be displayed with a
  prompt
- **AND** the state SHALL be identical to the initial load state

#### Scenario: Ctrl+L restores welcome state

- **WHEN** user presses Ctrl+L
- **THEN** the terminal history SHALL be cleared
- **AND** the connection initialization message SHALL be displayed
  ("Initializing secure connection..." with checkmark)
- **AND** the ASCII art banner with "Tulio Cunha Developer" SHALL be displayed
- **AND** the "Type help for tutorial" tip message SHALL be displayed with a
  prompt
- **AND** the state SHALL be identical to the initial load state

#### Scenario: Clear maintains unique entry IDs

- **WHEN** clear command or Ctrl+L is executed multiple times
- **THEN** each welcome state restoration SHALL use unique IDs for history
  entries
- **AND** no duplicate entries SHALL appear in the terminal
- **AND** the welcome messages SHALL not accumulate

#### Scenario: Clear accessibility announcement

- **WHEN** user clears the terminal with Ctrl+L or `clear` command
- **THEN** an accessibility announcement SHALL inform screen reader users that
  "Terminal cleared and reset to welcome state"
- **AND** the announcement SHALL be made with 'polite' priority
