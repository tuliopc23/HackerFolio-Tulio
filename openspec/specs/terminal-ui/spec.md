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

ALL command response templates SHALL be reformatted to use icon-first design
instead of text labels. Icon tokens SHALL replace text prefixes like "GitHub:",
"Status:", numbered lists, and section headers to create a cleaner, more
professional terminal UI that optimizes screen space while maintaining
accessibility.

#### Scenario: Whoami command uses icon-first formatting

- **WHEN** user types "whoami" or "info" command
- **THEN** GitHub link SHALL be prefixed with `[[icon:lucide/link|Link]]`
  instead of text "GitHub:"
- **AND** Status line SHALL be prefixed with `[[icon:lucide/hammer|Status]]`
  instead of text "Status:"
- **AND** all icons SHALL have accessible labels in the icon token syntax
- **AND** output SHALL be cleaner and more scannable

#### Scenario: Help command uses icon-first section headers

- **WHEN** user types "help" command
- **THEN** welcome heading SHALL be "Welcome! Type those words and press enter
  to:"
- **AND** emoji tip line SHALL be removed entirely
- **AND** "About Me" section SHALL be replaced with
  `[[icon:lucide/user-round|About me]]`
- **AND** "My Work" section SHALL be replaced with
  `[[icon:lucide/briefcase|My work]]`
- **AND** "Connect" section SHALL be replaced with
  `[[icon:lucide/link|Connect]]`
- **AND** "Terminal" section SHALL be replaced with
  `[[icon:lucide/terminal|Terminal]]`

#### Scenario: Ls command uses bullet list with icons

- **WHEN** user types "ls" or "projects" command
- **THEN** numbered list format (1. 2. 3.) SHALL be replaced with bullet points
  using `[[icon:lucide/dot|Item]]`
- **AND** each project SHALL start with the dot icon instead of a number
- **AND** output SHALL maintain vertical spacing and readability

#### Scenario: Grep command uses abbreviated heading with icons

- **WHEN** user types "grep" or "skills" command
- **THEN** heading SHALL be changed from "Technical Stack" to
  `[[icon:lucide/hammer|Tool]] Tech Stack`
- **AND** "Languages" label SHALL be replaced with icon-only tokens:
  `[[icon:simple/swift|Swift]] [[icon:simple/go|Go]] [[icon:simple/rust|Rust]] [[icon:simple/zig|Zig]] [[icon:simple/typescript|TypeScript]] [[icon:simple/python|Python]]`
- **AND** "MacOS & iOS Apps" SHALL show `[[icon:simple/swift|SwiftUI]]` with
  cyan color distinction
- **AND** "System's Programming" SHALL show
  `[[icon:lucide/wrench|Dev tools]] [[icon:lucide/terminal|CLI tools]]`
- **AND** "Web Backend" SHALL show only icon tokens:
  `[[icon:simple/gin|Gin]] [[icon:simple/hono|Hono]] [[icon:simple/vapor|Vapor]] [[icon:simple/actix|Actix]] [[icon:simple/fastify|Fastify]]`
- **AND** "Web Frontend" SHALL show only icon tokens:
  `[[icon:simple/react|React]] [[icon:simple/svelte|Svelte]] [[icon:simple/vuedotjs|Vue]] [[icon:simple/solid|Solid]] [[icon:simple/tailwindcss|Tailwind]]`
- **AND** "Web Meta Frameworks" SHALL show:
  `[[icon:lucide/tree-palm|TanStack Start]] [[icon:simple/remix|Remix]] [[icon:simple/nextdotjs|Next]] [[icon:simple/nuxt|Nuxt]] [[icon:simple/sveltekit|SvelteKit]]`
- **AND** "JS Runtimes" SHALL show:
  `[[icon:simple/bun|Bun]] [[icon:simple/nodedotjs|Node]] [[icon:simple/deno|Deno]]`
- **AND** "Cloud Native" SHALL show:
  `[[icon:simple/docker|Docker]] [[icon:simple/podman|Podman]] [[icon:simple/terraform|Terraform]]`

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
