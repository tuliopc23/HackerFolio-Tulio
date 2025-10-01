## ADDED Requirements

### Requirement: Timeline Command Displays Experience Entries

The terminal SHALL provide a `timeline` command that surfaces professional
experience entries in chronological order.

#### Scenario: Timeline command lists experience chronologically

- **GIVEN** timeline data exists with role, organization, start, and end dates
- **WHEN** a user runs the `timeline` command in the terminal
- **THEN** the output SHALL render entries ordered from most recent to oldest
- **AND** each entry SHALL display role title, organization, date range, and a
  one-line summary
- **AND** spacing SHALL align to the terminal grid without horizontal scrolling
  on 320px wide viewports

#### Scenario: Keyboard navigation within timeline output

- **GIVEN** the `timeline` command results are focused
- **WHEN** the user presses `ArrowUp`/`k` or `ArrowDown`/`j`
- **THEN** focus SHALL move between timeline entries without leaving the output
  pane
- **AND** the focused entry SHALL be highlighted with accessible contrast (WCAG
  AA)
- **AND** pressing `Enter` on a focused entry SHALL open the related project or
  external link when provided

#### Scenario: SSR output matches client timeline rendering

- **GIVEN** the server prerenders the terminal view for initial load
- **WHEN** the `timeline` command is present in the initial command buffer
- **THEN** the HTML emitted by the server SHALL match the client render
  structure for each entry
- **AND** hydration SHALL preserve keyboard navigation and focus management
  without warnings
- **AND** no additional network requests SHALL be required to display the
  timeline entries after hydration
