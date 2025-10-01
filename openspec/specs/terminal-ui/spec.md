# terminal-ui Specification

## Purpose

TBD - created by archiving change enhance-help-emphasis. Update Purpose after
archive.
## Requirements
### Requirement: Help Command Visual Emphasis

The welcome tip message SHALL emphasize the word "help" with increased font
weight and font size to improve discoverability. The help command output SHALL
use conversational, guided formatting instead of table-based layout.

#### Scenario: Initial terminal load displays emphasized help command

- **WHEN** the terminal loads and displays the welcome tip "Type help for
  tutorial"
- **THEN** the word "help" SHALL be rendered with bolder font weight than
  surrounding text
- **AND** the word "help" SHALL be rendered with larger font size (approximately
  1.15-1.2x relative) than surrounding text
- **AND** the styling SHALL be applied using ANSI escape codes and CSS classes,
  not hardcoded inline styles

#### Scenario: Help emphasis maintains terminal aesthetic

- **WHEN** the emphasized "help" word is displayed
- **THEN** the color scheme SHALL remain consistent with existing terminal
  colors (green #42be65)
- **AND** the phosphor glow effect SHALL be preserved
- **AND** no layout shifts or text overflow SHALL occur
- **AND** WCAG AA contrast requirements SHALL be maintained

#### Scenario: Help emphasis works across viewports

- **WHEN** the terminal is viewed on desktop or mobile viewport
- **THEN** the emphasized "help" word SHALL remain visually prominent
- **AND** text SHALL remain readable without truncation
- **AND** spacing SHALL remain consistent with terminal aesthetic

#### Scenario: Help command displays conversational guided format

- **WHEN** user invokes help command
- **THEN** output SHALL use conversational line-by-line format
- **AND** output SHALL NOT use section headers or grouping
- **AND** output SHALL NOT use ASCII table formatting or technical jargon
- **AND** command aliases SHALL be mentioned alongside original commands
- **AND** each line SHALL follow pattern: "Type [command] or [alias] to
  [action]"

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

### Requirement: Command Aliases for Non-Technical Users

The system SHALL provide user-friendly command aliases that map to existing
technical commands, allowing non-technical users to discover and use terminal
functionality without Unix CLI knowledge.

#### Scenario: Info command shows same output as whoami

- **WHEN** user types "info" command
- **THEN** system SHALL display the same response as "whoami" command
- **AND** response SHALL include name, description, GitHub link, and current
  status

#### Scenario: Projects command shows same output as ls

- **WHEN** user types "projects" command
- **THEN** system SHALL display the same response as "ls" command
- **AND** response SHALL list all portfolio projects with clickable names

#### Scenario: Skills command shows same output as grep

- **WHEN** user types "skills" command
- **THEN** system SHALL display the same response as "grep" command
- **AND** response SHALL show technical stack including languages, frameworks,
  and tools

#### Scenario: Github command shows same output as gh

- **WHEN** user types "github" command
- **THEN** system SHALL display the same response as "gh" command
- **AND** response SHALL include GitHub profile link

#### Scenario: Original technical commands continue to work

- **WHEN** user types original commands (whoami, ls, grep, gh)
- **THEN** system SHALL continue to display expected responses
- **AND** functionality SHALL remain unchanged

### Requirement: Conversational Help Command

The help command SHALL provide a conversational, line-by-line format that
explains what each command does using natural language. Each line should follow
the pattern "Type [command] or [alias] to [action]" with NO section headers or
grouping.

#### Scenario: Help command displays conversational format

- **WHEN** user types "help" command
- **THEN** response SHALL display commands in conversational format without
  section headers
- **AND** each line SHALL follow pattern: "Type [command] or [alias] to
  [action]"
- **AND** aliases SHALL be mentioned alongside original commands (e.g., "Type
  whoami or info to get information about me")
- **AND** no section groupings like "ABOUT ME", "PROJECTS", "CONTACT" SHALL be
  used
- **AND** no ASCII table characters or technical formatting SHALL be used
- **AND** output SHALL optimize screen space

#### Scenario: Help command maintains terminal aesthetic

- **WHEN** help output is displayed
- **THEN** ANSI color codes SHALL be used for visual hierarchy (cyan for
  sections, green for commands)
- **AND** text SHALL maintain phosphor glow effects consistent with terminal
  theme
- **AND** formatting SHALL be readable without horizontal scrolling

### Requirement: Optimized Command Output Formatting

ALL command response templates SHALL be reformatted to be cleaner and more
organized. They SHALL use hyperlinked text instead of raw URLs to optimize
screen space and improve readability while maintaining clickability.

#### Scenario: Contact command displays clean, hyperlinked output

- **WHEN** user types "contact" command
- **THEN** email SHALL be displayed as clickable hyperlink
  (contact@tuliocunha.dev)
- **AND** booking link SHALL be displayed as clickable hyperlink
  (fantastical.app/tuliocunha)
- **AND** raw URLs SHALL NOT be displayed in plain text
- **AND** output SHALL be cleaner and more organized than current implementation

#### Scenario: All commands use optimized formatting

- **WHEN** user types any command (whoami, ls, grep, gh, contact, open, help)
- **THEN** output SHALL be reformatted to be cleaner and more organized
- **AND** hyperlinked text SHALL be used where URLs are present
- **AND** layout SHALL optimize screen space

#### Scenario: Links open in new tab

- **WHEN** user clicks a hyperlink in command output
- **THEN** link SHALL open in new browser tab
- **AND** original terminal view SHALL remain open

### Requirement: Cat Command Removal

The cat command SHALL be removed from the system as it has no real usage in the
current implementation.

#### Scenario: Cat command returns helpful error

- **WHEN** user types "cat" command or "cat <project-name>"
- **THEN** system SHALL return error message
- **AND** error message SHALL suggest alternative commands (e.g., "Try
  'projects' or 'ls' to see available projects")

