## MODIFIED Requirements

### Requirement: Terminal Color Rendering

The terminal panes SHALL render text with consistent colors from the unified
color system.

#### Scenario: Command prompt colors

- **WHEN** displaying the command prompt
- **THEN** it SHALL use unified green (`#42be65`) for "user@" and ":~$" portions
  AND unified pink (`#ff7eb6`) for "portfolio" portion

#### Scenario: Interactive elements

- **WHEN** rendering buttons, links, or interactive elements
- **THEN** they SHALL use brightest cyan (`#33b1ff`) for primary actions and
  focus states

#### Scenario: Status indicators

- **WHEN** displaying status or metadata
- **THEN** they SHALL use the unified color tokens consistently (green for
  success, pink for emphasis, cyan for links)

### Requirement: Terminal Typography Scale

The terminal panes SHALL implement consistent typography sizing across all text
elements.

#### Scenario: Main terminal prompt

- **WHEN** rendering the main terminal prompt in `terminal-pane.tsx`
- **THEN** the font size SHALL be increased from `0.84375rem` to minimum
  `0.9375rem` (15px) or larger

#### Scenario: System info pane text

- **WHEN** rendering system information
- **THEN** headers SHALL use `text-xs` (0.75rem) AND body text SHALL use
  `text-[0.6875rem]` (11px) AND labels SHALL use `text-[0.625rem]` (10px) for
  proper hierarchy

#### Scenario: Overflow prevention

- **WHEN** rendering text that may exceed container width
- **THEN** the component SHALL apply `truncate`, `line-clamp-N`, or
  `overflow-hidden` classes to prevent layout breaks
