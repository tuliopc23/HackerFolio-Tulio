# Refine Terminal Output Icons

## Why

Terminal command outputs currently use text labels (e.g., "GitHub:", "Status:",
numbered lists, section headers) that create visual clutter and reduce the
professional appearance of the portfolio. Replacing these with contextual Lucide
and Simple Icons will create a cleaner, more icon-driven UI that aligns with
modern terminal aesthetics and improves scannability.

Additionally, the Recent Projects pane has layout issues where the GitHub footer
link is not visible without zooming out, creating excessive blank space. This
needs to be fixed by referencing the correctly working Personal Website pane
layout.

## What Changes

- **whoami command**: Replace "GitHub:" with link icon, replace "Status:" with
  hammer icon
- **help command**: Remove emoji tip, update heading text, replace section
  headers (About Me, My Work, Connect, Terminal) with contextual Lucide icons
- **ls command**: Change from numbered list (1. 2. 3.) to bullet list using
  lucide/dot icon
- **grep command**: Abbreviate heading to "Tech Stack" with hammer icon, replace
  all category labels with icons, use Simple Icons for all technologies
- **Icon registry**: Add missing icons (hammer, link, sveltekit, nuxt,
  nextdotjs, vapor, gin, actix, nitro, remix, docker)
- **Recent Projects pane**: Fix layout to match Personal Website pane so GitHub
  link appears in footer without excessive blank space

## Impact

- Affected specs: terminal-ui, database-schema
- Affected code:
  - `database/portfolio.db` (terminal_commands table)
  - `shared/iconography/registry.ts` (icon definitions)
  - `client/src/lib/icon-registry.tsx` (icon renderers)
  - `client/src/components/desktop/desktop-background.tsx` (Recent Projects pane
    layout)
