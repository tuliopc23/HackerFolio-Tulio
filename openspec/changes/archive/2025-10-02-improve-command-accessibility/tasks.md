## 1. Database Changes

- [ ] 1.1 Create new Drizzle migration file for command updates
- [ ] 1.2 Add alias commands (info, projects, skills, habilities, github) that
      reference same response_template as originals
- [ ] 1.3 Remove cat command from database
- [ ] 1.4 Update help command response_template with new conversational format
- [ ] 1.5 Update contact command with new email (contact@tuliocunha.dev) and
      booking link
- [ ] 1.6 Update all command response templates to use hyperlinked text instead
      of raw URLs
- [ ] 1.7 Regenerate Drizzle schema with `bun run db:generate`
- [ ] 1.8 Apply migration with `bun run db:migrate`

## 2. Frontend Updates

- [ ] 2.1 Update booking link in system-info-pane.tsx from
      fantastical.app/tuliopinheirocunha to fantastical.app/tuliocunha
- [ ] 2.2 Test all command aliases work correctly in terminal
- [ ] 2.3 Verify help command displays properly formatted output
- [ ] 2.4 Verify hyperlinks in command outputs are clickable

## 3. Testing & Validation

- [ ] 3.1 Test original commands still work (whoami, ls, grep, gh)
- [ ] 3.2 Test new aliases work (info, projects, skills, habilities, github)
- [ ] 3.3 Verify cat command is removed and returns appropriate error
- [ ] 3.4 Test help command readability and formatting
- [ ] 3.5 Verify contact information displays correctly
- [ ] 3.6 Run type checks: `bun run typecheck`
- [ ] 3.7 Run linter: `bun run lint`
