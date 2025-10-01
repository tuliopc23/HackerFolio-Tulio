## Why

- Visitors need a fast way to scan professional experience without leaving the
  terminal flow.
- Current commands surface projects and about sections but not a chronological
  summary.
- A dedicated `timeline` command keeps the focus on the interactive CLI
  narrative.

## What Changes

- Add a `timeline` terminal command that renders a chronological list of roles,
  companies, and dates.
- Support keyboard navigation (arrow keys / j-k) within the timeline output for
  accessibility.
- Source timeline entries from the existing content repository (Drizzle seed +
  template processor).
- Ensure server-rendered HTML mirrors the client behavior for SSR parity.

## Impact

- New data shape for experience entries (requires seeding + template update).
- Terminal renderer needs a new component for timeline layout with responsive
  formatting.
- Additional tests covering command parsing, rendering, and navigation
  shortcuts.
- Low risk to existing commands—isolated addition behind new command keyword.
