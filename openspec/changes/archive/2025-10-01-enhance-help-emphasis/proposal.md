# Enhance Help Emphasis

## Why

The welcome tip "Type help for tutorial" doesn't sufficiently draw user
attention to the "help" command. Users may miss this critical entry point for
discovering available commands. By making the word "help" more visually
prominent (bolder and larger), we improve discoverability and reduce friction
for new users.

## What Changes

- Increase font size of the word "help" in the welcome tip message
- Increase font weight of the word "help" to make it bolder
- Implement styling using ANSI escape codes and CSS classes (not hardcoded
  values)
- Maintain existing terminal aesthetic and color scheme

## Impact

- Affected specs: `terminal-ui`
- Affected code:
  - `client/src/components/terminal/terminal-pane.tsx:110` (tip message ANSI
    codes)
  - `client/src/components/terminal/typed-terminal-output.tsx` (ANSI parser, may
    need font size support)
  - `client/src/index.css` (ANSI CSS classes, may need new size class)
- No breaking changes
- Improves UX for new users
