## 1. Analysis

- [x] 1.1 Review current ANSI escape code implementation in terminal-pane.tsx
- [x] 1.2 Review ANSI parser in typed-terminal-output.tsx
- [x] 1.3 Check existing ANSI CSS classes in index.css
- [x] 1.4 Determine if custom CSS class is needed for font-size scaling

## 2. Implementation

- [x] 2.1 Add new ANSI CSS class for increased font size (if not existing)
- [x] 2.2 Extend ANSI parser to recognize custom font-size escape codes (if
      needed)
- [x] 2.3 Update tip message in terminal-pane.tsx to apply bolder weight and
      larger size to "help"
- [x] 2.4 Test visual appearance in browser

## 3. Validation

- [x] 3.1 Verify "help" word stands out visually (bolder, larger)
- [x] 3.2 Ensure no layout shifts or overflow issues
- [x] 3.3 Test on desktop and mobile viewports
- [x] 3.4 Run accessibility checks (contrast ratio maintained)
- [x] 3.5 Run `bun run check:all` (types, lint, format, tests)
