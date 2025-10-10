## ADDED Requirements

### Requirement: Icon Registry Expansion

The icon registry SHALL include all icons needed for terminal output formatting,
including technology logos from Simple Icons and contextual UI icons from
Lucide.

#### Scenario: Add missing Lucide icons

- **WHEN** icon registry is initialized
- **THEN** the following Lucide icons SHALL be registered: `lucide/link`,
  `lucide/briefcase`
- **AND** each SHALL have appropriate default labels for accessibility

#### Scenario: Add missing Simple Icons

- **WHEN** icon registry is initialized
- **THEN** the following Simple Icons SHALL be registered: `simple/sveltekit`,
  `simple/nuxt`, `simple/nextdotjs`, `simple/vapor`, `simple/gin`,
  `simple/actix`, `simple/remix`, `simple/docker`
- **AND** each SHALL render as SVG with correct brand color
- **AND** each SHALL have appropriate default labels

#### Scenario: Icons render in terminal output

- **WHEN** terminal processes icon tokens in command output
- **THEN** registered icons SHALL render as inline SVG or React components
- **AND** unregistered icon keys SHALL fall back to text format `[icon] Label`
- **AND** all icons SHALL maintain 1em × 1em sizing for inline alignment
