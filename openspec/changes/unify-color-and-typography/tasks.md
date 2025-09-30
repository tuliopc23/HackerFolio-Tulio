## 1. Color System Unification

- [x] 1.1 Audit all cyan color variations (`#33b1ff`, `#82cfff`, cyan classes)
      in the codebase
- [x] 1.2 Update CSS custom properties to use brightest cyan (`#33b1ff`) as
      primary
- [x] 1.3 Replace all hardcoded cyan hex values with unified `#33b1ff`
- [x] 1.4 Update ANSI colors to use `#33b1ff` for cyan
- [x] 1.5 Standardize green color to `#42be65` across all components
- [x] 1.6 Unify pink/magenta to `#be95ff` (bright) and `#ff7eb6` (soft)
- [x] 1.7 Update `user@portfolio` prompt to use unified green and pink colors
- [x] 1.8 Replace Tailwind utility classes (`text-green-400`, `text-pink-400`)
      with hex values in terminal components
- [x] 1.9 Verify ANSI color mappings match the unified palette

## 2. Typography Hierarchy Implementation

- [x] 2.1 Define typography scale in CSS custom properties (base sizes for each
      role)
- [x] 2.2 Enlarge terminal prompt typography (increase from 13.5px to 15px)
- [x] 2.3 Establish consistent font sizes for terminal pane headers
- [x] 2.4 Set harmonious body text sizes for system info pane
- [x] 2.5 Standardize label and metadata typography sizes
- [x] 2.6 Add overflow protection to prevent text from breaking card boundaries
- [x] 2.7 Test typography across all panes to ensure visual harmony
- [ ] 2.8 Verify typography scales appropriately on different screen sizes

## 3. Component Updates

- [x] 3.1 Update `terminal-pane.tsx` with unified colors and enlarged typography
- [x] 3.2 Update `system-info-pane.tsx` with unified colors and typography
- [x] 3.3 Update `ghostty-terminal-window.tsx` with unified colors
- [x] 3.4 Update `floating-dock-terminal.tsx` (already using unified colors)
- [x] 3.5 Update `LoadingScreen.tsx` colors to match unified palette
- [x] 3.6 Add typography CSS classes to index.css

## 4. Validation and Testing

- [ ] 4.1 Run visual regression tests on all terminal panes
- [ ] 4.2 Verify no text overflow or layout breaks
- [ ] 4.3 Check color contrast ratios for accessibility
- [ ] 4.4 Test on different viewport sizes
- [x] 4.5 Run `bun run check:all` to ensure no build errors
- [ ] 4.6 Validate with design review
