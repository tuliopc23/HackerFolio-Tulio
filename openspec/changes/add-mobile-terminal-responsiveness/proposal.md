# Mobile-First Terminal Responsiveness

## Why

The current HackerFolio terminal interface is optimized for desktop with fixed
large dimensions and two-pane layout, making it almost unusable on mobile
devices. Mobile users cannot access the portfolio content effectively, severely
limiting the site's reach and accessibility.

## What Changes

- **BREAKING**: Adaptive terminal layout that switches between desktop windowed
  mode and mobile full-screen mode
- **BREAKING**: Single-pane mobile experience with tab-based pane switching
- Mobile-accessible dock/navigation replacing desktop-only floating dock
- Touch-friendly interactions and gesture support
- Responsive typography and spacing for better mobile readability
- Optimized performance for mobile devices

## Impact

- Affected specs: terminal-interface (new capability)
- Affected code:
  - `client/src/components/terminal/ghostty-terminal-window.tsx` (major layout
    changes)
  - `client/src/components/terminal/floating-dock-terminal.tsx` (mobile
    navigation)
  - `client/src/index.css` (responsive breakpoints and mobile styles)
  - `client/src/components/terminal/terminal-pane.tsx` (adaptive pane behavior)
