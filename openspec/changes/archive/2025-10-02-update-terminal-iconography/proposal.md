# Update Terminal Iconography and Replace Emoji Usage

## Why

The portfolio still mixes bespoke SVGs, raw emoji, and text arrows to convey
meaning across the UI and terminal output. This inconsistent iconography breaks
visual hierarchy, creates accessibility issues (screen readers read raw emoji),
and prevents reuse of the `lucide-react` and `react-simple-icons` packages that
were added for this purpose. A cohesive icon system is needed to modernize the UI
and expose icons inside terminal command responses without shipping emoji.

## What Changes

- Replace the ad hoc `custom-icons` components with Lucide icons for core UI
  surfaces (projects page, floating dock, not-found view) and layer in
  purposeful embellishments (e.g., world clock badge, personal site cards) while
  preserving the terminal aesthetic.
- Introduce an icon registry that wraps `lucide-react` and
  `react-simple-icons`, exposes color/size defaults, and provides a lookup by key
  for use in both React components and terminal output rendering.
- Extend the terminal renderer to support inline icon tokens
  (`[[icon:source/name|aria-label]]`) so command templates stored in
  `portfolio.db` can reference icons without HTML or emoji. Ensure fallback text
  renders when an icon is missing or a11y prefers reduced icons.
- Migrate the terminal command content (`whoami`, `info`, `gh`, `github`,
  `contact`, `ls`) to remove emoji and reference Lucide/Simple Icons tokens as
  outlined in `iconography prompt.txt`. Reformat the `ls` stack list to display
  brand icons next to each tool name rather than parenthetical text.
- Add design-driven icon placements where they improve scannability (floating
  dock section headers, personal website card links, tip banners) without
  introducing clutter.

## Impact

- **Affected specs:** terminal-ui
- **Affected code:**
  - `client/src/components/icons/` (replace bespoke SVGs with registry exports)
  - `client/src/components/terminal/` (floating dock, system info, renderer)
  - `client/src/pages/{projects,not-found}.tsx`
  - `client/src/components/terminal/typed-terminal-output.tsx`
  - `server/utils/template-processor.ts`, `server/routes/terminal.ts`
  - New icon registry module shared by client/server (likely in `client/src/lib`
    and `server/utils`)
  - `database/portfolio.db` via migration under `drizzle/`
- **Breaking changes:** None expected for end users; CLI output format will gain
  icon tokens but retains plain-text fallbacks.
- **Migration:** Required to update terminal command templates and seed data.

## Open Questions

1. `grep` command: Should language/tool icons appear inline after each label, or
   would that over-clutter the dense skills list? Need design confirmation (defer
   decision until later).
2. [RESOLVED] Lucide icons in terminal output SHALL use the existing CSS color
   tokens (cyan, pink, green) — no new palette entries.
3. [RESOLVED] Icons always render; no additional user preference or text-only mode
   is planned.
