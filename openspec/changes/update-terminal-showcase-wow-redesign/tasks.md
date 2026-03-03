## 1. Implementation

- [x] 1.1 Add terminal-first showcase framing layer on home without demoting
      terminal interaction priority.
- [x] 1.2 Create reusable visual primitives for display/UI typography,
      atmospheric background layers, and panel depth styling.
- [x] 1.3 Redesign `/projects` route into a premium editorial gallery while
      keeping current API/query contracts unchanged.
- [x] 1.4 Add reduced-motion safeguards for newly introduced decorative effects.
- [x] 1.5 Add visual quality scorecard documentation and codify release gate
      expectations.
- [x] 1.6 Add PR template checklist section for visual quality gate.
- [x] 1.7 Exclude transient Wrangler artifacts from lint scope to stabilize
      quality checks.

## 2. Validation

- [x] 2.1 Run `bun run check:types`.
- [x] 2.2 Run `bun run check:lint`.
- [x] 2.3 Run `bun run check:format`.
- [x] 2.4 Run `bun run test` and verify no new regressions beyond known baseline
      failures.
- [x] 2.5 Run
      `openspec validate update-terminal-showcase-wow-redesign --strict`.
