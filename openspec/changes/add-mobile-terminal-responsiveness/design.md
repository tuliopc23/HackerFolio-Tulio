## Context

The current terminal interface was designed desktop-first with fixed dimensions
and assumes mouse/keyboard interaction. Mobile devices require a fundamentally
different approach due to:

- Limited screen real estate (320px-400px width typical)
- Touch-based interaction patterns
- Virtual keyboard constraints
- Performance limitations
- Different user expectations and usage patterns

## Goals / Non-Goals

**Goals:**

- Make terminal fully functional on mobile devices
- Maintain terminal aesthetic and brand consistency
- Ensure smooth touch interactions
- Preserve all functionality in mobile-adapted form
- Optimize performance for mobile devices

**Non-Goals:**

- Redesigning desktop experience (desktop remains unchanged)
- Adding mobile-specific features beyond responsiveness
- Supporting landscape-only mobile usage

## Decisions

**Decision: Breakpoint-based adaptive layouts**

- Use CSS breakpoints to switch between desktop windowed and mobile full-screen
  modes
- Maintain existing desktop experience above 768px
- Mobile-first approach below 768px
- **Alternatives considered**: Progressive enhancement vs mobile-specific
  routes. Chose adaptive CSS for code simplicity.

**Decision: Tab-based pane switching on mobile**

- Convert side-by-side panes to stackable tabs on mobile
- Single active pane visible at a time on small screens
- Tab bar at top of terminal for pane selection
- **Alternatives considered**: Horizontal scroll, accordion layout. Chose tabs
  for familiar mobile UX.

**Decision: Bottom navigation dock for mobile**

- Move floating dock to fixed bottom position on mobile
- Touch-friendly sizing (min 44px tap targets)
- Persistent visibility for easy access
- **Alternatives considered**: Hamburger menu, slide-out drawer. Chose bottom
  nav for quick access.

## Risks / Trade-offs

- **Complexity**: Maintaining two layout systems increases code complexity
- **Performance**: Additional CSS and JS for responsiveness
- **Testing burden**: Need to test across many device sizes
- **User confusion**: Different interaction patterns between desktop/mobile

**Mitigations:**

- Use CSS-only solutions where possible to minimize JS overhead
- Implement progressive enhancement approach
- Comprehensive device testing strategy
- Clear visual cues for mobile interactions

## Migration Plan

1. **Phase 1**: Implement adaptive layouts without breaking desktop
2. **Phase 2**: Add mobile navigation and touch interactions
3. **Phase 3**: Performance optimizations and mobile-specific polish
4. **Phase 4**: Comprehensive testing and refinement

**Rollback**: CSS-based implementation allows easy rollback by removing mobile
styles

## Open Questions

- Should we support landscape orientation specifically?
- Do we need offline functionality for mobile?
- Should mobile have simplified command set?
