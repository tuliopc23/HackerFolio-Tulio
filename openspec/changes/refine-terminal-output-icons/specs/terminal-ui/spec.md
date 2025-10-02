## MODIFIED Requirements

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
