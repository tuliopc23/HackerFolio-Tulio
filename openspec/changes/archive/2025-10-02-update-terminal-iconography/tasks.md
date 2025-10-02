## 1. Audit & Replace UI Iconography

- [ ] 1.1 Swap bespoke `custom-icons` imports for Lucide components on projects,
      dock, and error surfaces
- [ ] 1.2 Add lightweight Lucide adornments (e.g., `Clock4`, `ArrowUpRight`,
      `Calendar`) to world clock and personal website cards following spacing
      guidelines
- [ ] 1.3 Verify hover/focus states still meet contrast requirements after icon
      updates

## 2. Icon Infrastructure

- [ ] 2.1 Create shared icon registry that maps semantic keys to Lucide/Simple
      Icons exports with size/color defaults
- [ ] 2.2 Extend terminal renderer (`template-processor`,
      `typed-terminal-output`) to parse `[[icon:source/name|label]]` tokens with
      graceful fallback text
- [ ] 2.3 Add automated tests for icon token parsing and rendering (including
      unknown icon fallback)

## 3. Terminal Content Migration

- [ ] 3.1 Author Drizzle migration to update `whoami`, `info`, `gh`, `github`,
      `contact`, and `ls` command templates to icon tokens (no emoji)
- [ ] 3.2 Update portfolio content seeding/tools so regenerated databases
      preserve icon keys
- [ ] 3.3 Review `iconography prompt.txt` and confirm replacements align with
      registry keys (document any deviations)

## 4. QA & Validation

- [ ] 4.1 Run existing unit/integration tests (`bun run check:all`)
- [ ] 4.2 Capture before/after screenshots or recordings for terminal icon
      rendering (for review)
- [ ] 4.3 Validate change with
      `openspec validate update-terminal-iconography --strict`
