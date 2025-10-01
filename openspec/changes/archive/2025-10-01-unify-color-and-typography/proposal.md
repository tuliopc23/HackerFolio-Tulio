# Unify Color System and Typography Hierarchy

## Why

The project currently has inconsistent color usage across components with
multiple cyan variations (`#33b1ff`, `#82cfff`), mixed green/pink references
(Tailwind classes vs hex codes), and fragmented typography sizing that creates
visual disharmony. The terminal prompt typography is too small, and various
panes lack consistent typographic organization, creating readability issues and
breaking the visual hierarchy.

## What Changes

- **Color System Unification:**
  - Standardize all cyan usage to the brightest cyan (`#33b1ff`) across the
    entire project
  - Unify green color to `#42be65` (terminal-green) consistently
  - Standardize pink/magenta to `#be95ff` (magenta-bright primary) and `#ff7eb6`
    (magenta-soft secondary)
  - Replace all hardcoded hex colors with CSS custom properties
  - Ensure `user@portfolio` prompt uses unified green (`#42be65`) and pink
    (`#ff7eb6`) colors

- **Typography Hierarchy:**
  - Enlarge terminal prompt typography from current size to improve readability
  - Establish consistent typography scale across all terminal panes
  - Create harmonious font size relationships between headers, body text, and
    labels
  - Ensure typography respects card boundaries and prevents overflow
  - Define clear typographic roles: prompt, command, output, labels, headers

## Impact

- Affected specs: `design-system`, `terminal-ui`
- Affected code:
  - `client/src/index.css` - CSS custom properties and color variables
  - `tailwind.config.ts` - Color token definitions
  - `client/src/components/terminal/terminal-pane.tsx` - Terminal prompt colors
    and sizes
  - `client/src/components/terminal/system-info-pane.tsx` - Info pane typography
    and colors
  - `client/src/components/terminal/ghostty-terminal-window.tsx` - Window
    typography
  - `client/src/components/terminal/floating-dock-terminal.tsx` - Dock menu
    typography
  - All component files using cyan, green, pink colors
