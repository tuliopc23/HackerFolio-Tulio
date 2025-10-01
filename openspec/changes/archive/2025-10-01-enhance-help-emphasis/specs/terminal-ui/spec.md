## ADDED Requirements

### Requirement: Help Command Visual Emphasis

The welcome tip message SHALL emphasize the word "help" with increased font
weight and font size to improve discoverability.

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
