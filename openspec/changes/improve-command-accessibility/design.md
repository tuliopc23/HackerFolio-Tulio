## Context

This change addresses a UX gap where non-technical users struggle to navigate
the terminal interface. The current implementation assumes Unix CLI familiarity,
which creates barriers for broader audiences viewing the portfolio.

## Goals / Non-Goals

**Goals:**

- Make commands discoverable and intuitive for non-technical users
- Maintain terminal aesthetic while improving readability
- Preserve existing technical commands for users who prefer them
- Optimize screen space by using hyperlinked text

**Non-Goals:**

- Complete overhaul of terminal command processing system
- Adding autocomplete or command suggestions (future enhancement)
- Changing visual theme or color scheme
- Modifying existing command functionality beyond formatting

## Decisions

### Command Aliasing Strategy

**Decision:** Store aliases as separate database rows pointing to same
response_template **Rationale:** Simple to implement, easy to maintain, no code
changes to command processor **Alternatives considered:**

- Store aliases in JSON array column: Requires command processor changes, less
  visible in queries
- Hardcode aliases in frontend: Violates single source of truth, harder to
  update

### Help Command Format

**Decision:** Replace table-based format with conversational, guided text
**Format:**

```
Welcome! Here's what you can do:

ABOUT ME
Type "whoami" or "info" to learn about me
Type "grep" or "skills" to see my technical abilities

PROJECTS
Type "ls" or "projects" to see my recent work

CONTACT
Type "contact" for my email and booking link
Type "gh" or "github" for my GitHub profile
Type "open" to visit www.tuliocunha.dev

SYSTEM
Type "clear" to clear the terminal output
```

**Rationale:** More readable, less intimidating, guides user through options
**Alternatives considered:**

- Keep table format with friendlier descriptions: Still assumes CLI familiarity
- Interactive menu system: Too different from terminal aesthetic

### URL Handling

**Decision:** Wrap URLs in hyperlinks with descriptive text **Example:**
`{{ansi.cyan("Email:"")}} [contact@tuliocunha.dev](mailto:contact@tuliocunha.dev)`
**Rationale:** Saves screen space, cleaner appearance, maintains clickability
**Note:** Markdown-style links are parsed by the ANSI renderer in
typed-terminal-output.tsx

### Contact Information Updates

**Decision:** Update email to contact@tuliocunha.dev and booking to
fantastical.app/tuliocunha **Locations:**

- Database: contact command response_template
- Frontend: system-info-pane.tsx line ~491

## Risks / Trade-offs

**Risk:** Existing users bookmarked or documented old commands like "cat"
**Mitigation:** Return helpful error message suggesting alternatives

**Risk:** Database migration could fail on production **Mitigation:** Test
migration locally first, keep rollback SQL ready

**Trade-off:** Adding aliases increases database rows but improves
discoverability **Accepted:** Small database size increase is worth the UX
improvement

## Migration Plan

1. Create migration file in `drizzle/` directory
2. Test migration on local database
3. Regenerate schema with `bun run db:generate`
4. Apply migration with `bun run db:migrate`
5. Verify all commands work in local development
6. Deploy to production
7. Monitor for any command processing errors

**Rollback:** Remove alias commands via SQL DELETE, restore old help template

## Open Questions

None - requirements are clear from user request.
