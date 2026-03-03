## ADDED Requirements

### Requirement: Terminal-First Showcase Composition

The home experience SHALL present a high-impact visual framing that enhances the
terminal while preserving the terminal as the primary interactive and visual
focus.

#### Scenario: Terminal remains dominant when showcase framing is visible

- **WHEN** the home route loads with atmospheric layers and marketing framing
  enabled
- **THEN** the terminal window SHALL remain visually dominant in hierarchy and
  contrast
- **AND** terminal controls and input SHALL remain the primary interaction path
- **AND** framing content SHALL not block terminal interaction when terminal is
  active

#### Scenario: Terminal can be restored from framing layer

- **WHEN** the terminal is minimized or hidden
- **THEN** the framing layer SHALL provide an explicit action to restore/open
  the terminal
- **AND** the restore action SHALL return users to the same terminal-first
  interaction model

### Requirement: Premium Projects Showcase Presentation

The projects route SHALL use a premium editorial presentation style while
preserving current project data contracts and route behavior.

#### Scenario: Projects page keeps data contract and improves hierarchy

- **GIVEN** project data is returned by the existing query/API model
- **WHEN** the projects route renders
- **THEN** project cards SHALL present stronger visual hierarchy for title,
  description, and technologies
- **AND** no backend endpoint or payload format SHALL be changed
- **AND** existing project links SHALL remain functional

#### Scenario: Projects route remains responsive across target breakpoints

- **WHEN** the projects route is viewed at 375px, 768px, 1024px, and 1440px
  widths
- **THEN** card layout SHALL remain readable without horizontal overflow
- **AND** interactive controls SHALL remain reachable and visually clear

### Requirement: Visual Quality Governance Gate

The repository SHALL maintain a measurable visual quality gate for showcase UI
changes.

#### Scenario: Visual scorecard is required for showcase UI work

- **WHEN** a PR includes terminal showcase UI or projects showcase visual
  changes
- **THEN** a visual scorecard SHALL be completed using the documented rubric
- **AND** the score SHALL be at least 85/100 before merge
- **AND** evidence screenshots SHALL include home hero, active terminal state,
  and projects gallery

#### Scenario: Accessibility integrity remains required under visual gate

- **WHEN** visual enhancements introduce motion or layered effects
- **THEN** reduced-motion fallbacks SHALL be provided
- **AND** keyboard focus visibility SHALL remain compliant
- **AND** text contrast SHALL continue meeting WCAG AA thresholds
