## 1. Backend Changes

- [x] 1.1 Update `clear` command response in `server/routes/terminal.ts` to
      signal welcome state restoration instead of just clearing

## 2. Frontend Changes

- [x] 2.1 Extract initial welcome state (boot message, ASCII art, tip) into a
      reusable function or constant
- [x] 2.2 Update Ctrl+L handler in `terminal-pane.tsx` to restore welcome state
      instead of `setHistory([])`
- [x] 2.3 Update command processing for `clear` command to restore welcome state
- [x] 2.4 Ensure welcome messages maintain unique IDs to prevent duplicates

## 3. Testing

- [x] 3.1 Test Ctrl+L restores welcome state correctly
- [x] 3.2 Test `clear` command restores welcome state correctly
- [x] 3.3 Verify ASCII art renders properly after clear
- [x] 3.4 Verify no duplicate welcome messages appear
- [x] 3.5 Test accessibility announcements for clear action
