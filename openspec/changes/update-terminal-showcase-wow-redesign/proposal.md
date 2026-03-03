## Why

HackerFolio already delivers a strong terminal concept, but the visual language
around it does not yet feel unmistakably world-class. The current experience is
functional and thematic, yet it can be elevated into a memorable showcase that
signals design and engineering craftsmanship immediately.

## What Changes

- Introduce a terminal-first showcase composition with a cinematic framing layer
  that amplifies, not replaces, the terminal interaction.
- Standardize visual primitives (typography roles, atmospheric layers, panel
  depth) to ensure coherent polish across home and projects.
- Upgrade project showcase presentation to feel editorial and premium while
  preserving existing data flows and routes.
- Add a visual quality scorecard and release gate so future UI work can be
  measured, reviewed, and improved systematically.
- Harden quality checks by excluding transient Wrangler build artifacts from
  lint scope.

## Impact

- Affected specs: `frontend-showcase` (new capability in this change set)
- Affected code:
  - `client/src/components/desktop/desktop-background.tsx`
  - `client/src/components/desktop/portfolio-marketing-overlay.tsx` (new)
  - `client/src/pages/home.tsx`
  - `client/src/pages/projects.tsx`
  - `client/src/index.css`
  - `eslint.config.js`
  - `docs/design/visual-quality-scorecard.md` (new)
  - `.github/pull_request_template.md` (new)
