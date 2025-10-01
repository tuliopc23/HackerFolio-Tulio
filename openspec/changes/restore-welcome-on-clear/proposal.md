## Why

Currently, the `clear` command and Ctrl+L keyboard shortcut completely empty the
terminal screen, leaving only a blank prompt at the top. This differs from the
initial state that users see when first accessing the application, which
includes the connection message, ASCII art banner with "Tulio Cunha Developer",
and the helpful "Type help for tutorial" tip. Users expect the clear command to
reset the terminal to this welcoming default state rather than leaving an empty
screen.

## What Changes

- Modify the clear command handler (both Ctrl+L and the `clear` command) to
  restore the initial welcome state instead of leaving a blank screen
- Restore the connection initialization message ("Initializing secure
  connection..." with checkmark)
- Restore the ASCII art banner showing "Tulio Cunha Developer"
- Restore the "Type help for tutorial" tip message with prompt
- Ensure the behavior is consistent whether clearing via Ctrl+L keyboard
  shortcut or running the `clear` command

## Impact

- Affected specs: `terminal-ui`
- Affected code: `client/src/components/terminal/terminal-pane.tsx` (clear
  handler in keyboard event and command processing)
- Affected code: `server/routes/terminal.ts` (clear command response handling)
- User experience: Improves consistency and provides better visual orientation
  after clearing the terminal
