## Context

HackerFolio's identity is terminal-first. The redesign must increase visual
impact and recall while avoiding brand drift into a generic marketing site. The
terminal window remains the center of gravity for both interaction and
perception.

## Goals

- Deliver a high-impact "wow" presentation around the terminal experience.
- Preserve terminal-first interaction hierarchy.
- Improve coherence across home and projects through shared visual primitives.
- Add a measurable quality framework for visual changes.

## Non-Goals

- No backend/API/database contract changes.
- No replacement of terminal UX with traditional landing-page structure.
- No conversion-funnel optimization as primary objective.

## Decisions

### Decision 1: Terminal-first composition

Use a framing overlay that introduces positioning and capability signals while
keeping the terminal z-layer and interaction flow dominant.

### Decision 2: Explicit visual primitives

Define reusable primitives in global CSS:

- `font-display` for expressive headlines
- `font-ui` for readable supporting text
- `mesh-aura` for atmospheric backdrop
- `grain-overlay` for texture
- `panel-glow` for layered depth

### Decision 3: Projects as editorial gallery

Retain existing data and route plumbing, but redesign cards and page hero with
stronger hierarchy, cleaner badges, and premium surfaces.

### Decision 4: Quality governance

Introduce a scorecard and PR checklist gate with explicit minimum pass threshold
before merge.

## Risks and Trade-offs

- Risk: Decorative layers may reduce readability.
  - Mitigation: Terminal contrast and z-index priority remain enforced.
- Risk: Motion can hurt accessibility.
  - Mitigation: `prefers-reduced-motion` fallback disables decorative
    transitions.
- Risk: Lint instability from generated Wrangler temp files.
  - Mitigation: ignore `.wrangler/**` in ESLint config.

## Rollout Plan

1. Implement visual primitives and overlay.
2. Apply projects page redesign with shared primitives.
3. Add quality governance docs and PR template.
4. Run full validation gates including OpenSpec strict validation.

## Open Questions

None. This change is decision-complete for implementation.
