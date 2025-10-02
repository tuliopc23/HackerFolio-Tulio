## ADDED Requirements

### Requirement: Unified Icon Components Across Surfaces

The portfolio UI SHALL standardize on Lucide React for existing iconography and
introduce new accent icons only where they improve scannability and
accessibility without breaking the terminal aesthetic.

#### Scenario: Projects surface and dock use Lucide icons with terminal styling

- **WHEN** the projects route renders its header, CTA buttons, and featured
  badge
- **THEN** the back navigation, external link, GitHub, and featured/star icons
  SHALL be rendered with Lucide React components (`ArrowLeft`, `ExternalLink`,
  `Github`, `Star` or equivalent) using 16–20px sizing and terminal palette
  classes
- **AND** the floating dock SHALL use Lucide icons (`Home`, `FolderOpen`,
  `Palette`, `Terminal` or equivalent) instead of bespoke SVGs, with accessible
  labels (e.g., `aria-label` or `<title>`) for screen readers
- **AND** the not-found page SHALL display a Lucide `AlertCircle` icon with the
  existing error styling (no raw emoji)

#### Scenario: System info panels add purposeful Lucide adornments

- **WHEN** the desktop-like system info panel renders the World Clock and
  Personal Website cards
- **THEN** each card heading SHALL include a Lucide icon (`Clock4` for World
  Clock, `Globe`, `ArrowUpRight`, `CalendarClock` or equivalent for
  personal-site links) aligned within the existing typography scale
- **AND** icons SHALL respect the existing terminal color tokens
  (cyan/pink/green) with no new palette colors and maintain WCAG AA contrast on
  both light text and dark backgrounds
- **AND** hover/focus states SHALL preserve icon visibility alongside text
  underline/highlight styles

### Requirement: Terminal Output Supports Icon Tokens

The terminal rendering pipeline SHALL understand declarative icon tokens that
map to Lucide or Simple Icons, ensuring icons appear inline with ANSI-colored
text and remain accessible.

#### Scenario: Icon tokens render Lucide/Simple Icons inline with fallback text

- **GIVEN** a command response string containing
  `[[icon:lucide/ghost|Terminal avatar]]` or `[[icon:simple/react|React logo]]`
- **WHEN** the terminal output is processed client-side
- **THEN** the renderer SHALL replace each token with the mapped icon component
  sized to the current line height and tinted per ANSI color context using the
  existing cyan/pink/green CSS variables
- **AND** the resulting markup SHALL include visually-hidden text equal to the
  provided label ("Terminal avatar", "React logo") for assistive technology,
  falling back to the label string if an icon mapping is missing
- **AND** if the icon key is unknown, the renderer SHALL emit the label text
  prefixed with `[icon]` to preserve meaning without crashing

#### Scenario: Server template processor preserves icon tokens during rendering

- **WHEN** a terminal command template includes icon tokens stored in
  `portfolio.db`
- **THEN** the template processor SHALL pass the tokens through (no escaping or
  stripping) while still resolving ANSI helpers and custom handlers
- **AND** automated tests SHALL cover icon token round-tripping so future
  template edits do not regress icon rendering

### Requirement: Command Content Replaces Emoji With Icon Tokens

All terminal command templates stored in `portfolio.db` SHALL eliminate emoji
usage and leverage icon tokens so visual affordances come from the shared icon
registry.

#### Scenario: Profile and contact commands use Lucide icons instead of emoji

- **WHEN** `whoami` or its alias `info` executes
- **THEN** the ghost/footer emoji SHALL be replaced by Lucide `Ghost` (or
  `Skull`) icon token tinted via ANSI green, and the lightning emoji SHALL be
  replaced by Lucide `Bolt`
- **AND** executing `contact` SHALL render Lucide icons for email (e.g.,
  `Mail`), LinkedIn (`Linkedin`), and booking (`CalendarClock`) without any
  emoji characters in the output
- **AND** executing `gh`/`github` SHALL prefix the heading with a magenta-tinted
  Lucide `Github` icon per `iconography prompt.txt`

#### Scenario: `ls` command lists stack tools with Simple Icons

- **WHEN** the `ls` command renders project tech stacks
- **THEN** each tool reference (React, Bun, Vite, Tailwind, SwiftUI, macOS,
  etc.) SHALL append the corresponding Simple Icon token
  `[[icon:simple/<tool>|<Tool name>]]` instead of parentheses or emoji
- **AND** no command output in `portfolio.db` SHALL contain emoji characters
  after the migration (verification via CI lint/check)
- **AND** the command tip section SHALL continue to use ANSI styling with Lucide
  icons where emphasis is required (e.g., `Lightbulb` for tips) while
  maintaining the terminal layout
