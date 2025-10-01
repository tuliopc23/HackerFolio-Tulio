# Improve Command Accessibility and UX for Non-Technical Users

## Why

The terminal workflow simulation is difficult for non-technical users to
navigate. The current help command uses technical Unix-like terminology and
table-based formatting that assumes familiarity with command-line interfaces.
Users need more intuitive command aliases (e.g., "info" for "whoami", "projects"
for "ls") and clearer, guided help text that explains what each command does in
plain language rather than presenting a dense table of options.

## What Changes

- Add user-friendly command aliases that map to existing technical commands
- Reformat help command output to be more conversational and guided (remove
  table formatting)
- Update command response templates to optimize space using hyperlinked text
  instead of raw URLs
- Remove `cat` command (no real usage in current implementation)
- Update contact information and booking links throughout
- Regenerate Drizzle schema after database modifications

**Alias mappings:**

- `info` → `whoami`
- `projects` → `ls`
- `skills` → `grep`
- `github` → `gh`

**Updated information:**

- Email: contact@tuliocunha.dev
- Booking: fantastical.app/tuliocunha (update in system-info-pane.tsx and
  contact command)

## Impact

- **Affected specs:** terminal-ui, database-schema (new)
- **Affected code:**
  - `database/portfolio.db` - terminal_commands table
  - `drizzle/` - new migration for command aliases and updated templates
  - `server/db/schema.ts` - Drizzle schema
  - `client/src/components/terminal/system-info-pane.tsx` - booking link update
  - Terminal command processing logic
- **Breaking changes:** None (aliases are additive, original commands remain)
- **Migration:** New database migration to add alias commands and update
  response templates
