# Visual Quality Scorecard

Use this scorecard for showcase-facing UI changes (home terminal shell, projects
gallery, global visual primitives).

## Pass Threshold

- Minimum pass score: **85 / 100**
- Hard fail conditions:
  - Terminal interaction is visually or functionally demoted
  - Focus visibility is broken for keyboard users
  - Reduced-motion mode is ignored for decorative effects

## Scoring Rubric (100 points)

## 1) Composition and Hierarchy (20)

- Terminal remains visual center of gravity (0-10)
- Supporting content frames, not competes with, terminal (0-5)
- Information hierarchy is immediate and scannable (0-5)

## 2) Typography Craft (20)

- Clear role split across display/UI/mono typography (0-8)
- Headline rhythm and spacing feel intentional (0-6)
- Supporting copy remains highly readable (0-6)

## 3) Motion and Interaction Craft (15)

- Motion improves orientation and delight, not noise (0-8)
- Hover/focus states are distinct and stable (0-4)
- Motion timing feels coherent across components (0-3)

## 4) Depth, Atmosphere, and Materials (15)

- Layering creates depth without clutter (0-6)
- Atmospheric effects support brand tone (0-5)
- Surfaces and shadows remain consistent (0-4)

## 5) Visual Consistency and Token Discipline (15)

- Shared visual primitives are reused consistently (0-7)
- Accent palette remains controlled and intentional (0-4)
- Spacing cadence and border language are coherent (0-4)

## 6) Accessibility Integrity (15)

- WCAG AA text contrast maintained (0-6)
- Keyboard focus order and indicators remain clear (0-5)
- `prefers-reduced-motion` behavior is respected (0-4)

## Evidence Checklist

Attach at least 3 screenshots:

1. Home route with terminal active
2. Home route with terminal minimized/hidden and framing visible
3. Projects route (desktop and at least one small viewport)

Optional but recommended:

- Short 5-10 second screen recording of motion behavior
- Annotated notes on deliberate tradeoffs

## Review Workflow

1. Author self-scores each category.
2. Reviewer independently scores each category.
3. Merge allowed only when both agree score >= 85.
4. If score < 85, list top 3 visual deltas required before merge.
