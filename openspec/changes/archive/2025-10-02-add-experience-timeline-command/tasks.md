## 1. Implementation

- [ ] 1.1 Seed timeline entries (Drizzle migration + template content helpers).
- [ ] 1.2 Expose timeline data through terminal content service/command config.
- [ ] 1.3 Render timeline output component with responsive layout + keyboard
      navigation.
- [ ] 1.4 Ensure SSR matches client render for the `timeline` command.
- [ ] 1.5 Add unit/integration tests for command parsing, data formatting, and
      navigation.
- [ ] 1.6 Document the new command in terminal help text and README.

## 2. Validation

- [ ] 2.1 Run `bun run check:all`.
- [ ] 2.2 Verify `openspec validate add-experience-timeline-command --strict`
      passes.
