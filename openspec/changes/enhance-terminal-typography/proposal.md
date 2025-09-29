# Enhanced Terminal Typography

## Why

The current terminal typography uses basic font weights and limited text
styling, missing opportunities to improve readability, visual hierarchy, and
aesthetic polish. Better typography will enhance the overall terminal experience
while maintaining the Ghostty aesthetic.

## What Changes

- Enhanced font weight variations for different text types (headers, commands,
  output)
- Improved text shadow and phosphor glow effects for better readability
- Optimized line heights and letter spacing for terminal content
- Better visual hierarchy through typography scaling
- Enhanced code syntax highlighting with existing color palette

## Impact

- Affected specs: terminal-interface (typography enhancements)
- Affected code:
  - `client/src/index.css` (typography utilities and font definitions)
  - `client/src/components/terminal/terminal-pane.tsx` (text styling)
  - `client/src/components/terminal/typed-terminal-output.tsx` (output
    formatting)
  - `client/src/components/terminal/command-processor.ts` (command styling)
