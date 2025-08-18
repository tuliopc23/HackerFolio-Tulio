# Overview

This is a terminal-inspired portfolio website for Tulio Cunha, a full-stack developer. The application features a vintage CRT aesthetic with a Lumon-inspired terminal interface, offering an interactive command-line experience alongside traditional web pages. The portfolio showcases projects, skills, and contact information through both a primary terminal interface and conventional page routes.

# User Preferences

Preferred communication style: Simple, everyday language.
Design preferences: Vintage terminal aesthetics with deep blue CRT effects, scan lines, chromatic aberrations, and glow effects on text. Rounded corners on buttons. Fast ASCII graphics with system information display.

# System Architecture

## Frontend Architecture

- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with support for both terminal navigation and traditional page routes
- **Styling**: Tailwind CSS with custom CSS variables for theme support (Lumon, Neon, Mono themes)
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interfaces
- **State Management**: React Context for theme management and local state for terminal functionality
- **Typography**: JetBrains Mono font for monospace terminal aesthetic

## Backend Architecture

- **Server**: Express.js with TypeScript
- **Development Setup**: Vite middleware integration for hot module replacement
- **API Structure**: RESTful endpoints under `/api` namespace for health checks, profile data, projects, and terminal logging
- **Static Serving**: Vite handles static assets and client bundle serving

## Terminal Interface Design

- **Command Processing**: Custom command processor with history management, autocomplete, and command routing
- **Layout**: CSS Grid-based tmux-style pane system with resizable panels
- **Interactivity**: Full keyboard navigation with arrow key history, tab completion, and focus management
- **Themes**: Dynamic theme switching between Lumon (default), Neon, and Mono color schemes

## Data Management

- **Portfolio Content**: Static data structures in TypeScript for projects, profile information, and content
- **State Persistence**: localStorage for terminal history and theme preferences
- **Query Layer**: TanStack Query for potential future API integration and caching

## Database Schema (Prepared but not actively used)

- **ORM**: Drizzle ORM with PostgreSQL dialect configured
- **Tables**: Users, projects, and portfolio content tables with proper relationships
- **Schema Management**: Type-safe schema definitions with Zod validation

## Accessibility & Performance

- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation, skip links, and screen reader support
- **Performance**: Code splitting, lazy loading, and optimized bundle size
- **Progressive Enhancement**: Graceful degradation for users without JavaScript

# External Dependencies

## Core Framework Dependencies

- **React Ecosystem**: React 18, React DOM, React Router (Wouter)
- **Build Tools**: Vite for development and building, TypeScript for type safety
- **State Management**: TanStack Query for server state, React Context for client state

## UI and Styling

- **CSS Framework**: Tailwind CSS with PostCSS for styling
- **Component Library**: Radix UI primitives for accessible base components
- **Icons**: Lucide React for consistent iconography
- **Fonts**: Google Fonts (JetBrains Mono) for terminal typography

## Database and Backend

- **Database**: PostgreSQL with Neon Database serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type validation and schema validation
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions

## Development and Utilities

- **Utilities**: clsx and tailwind-merge for conditional styling
- **Date Handling**: date-fns for date manipulation and formatting
- **Development**: Replit-specific plugins for development environment integration

## Deployment Considerations

- **Production Build**: Optimized Vite build with ESBuild for server bundling
- **Environment**: Configured for both development (with HMR) and production deployment
- **Static Assets**: Proper asset handling and optimization through Vite

# Recent Changes (August 18, 2025)

## Vintage Terminal Aesthetic Implementation

✓ **Complete CSS Overhaul**: Reimplemented entire CSS system with vintage terminal aesthetics
✓ **Deep Blue CRT Theme**: Updated color scheme to deep blue vintage CRT colors
  - Primary: Deep space black (#000811) and navy blue (#001a2e, #003366)
  - Accents: Electric cyan (#00ccff, #33ddff) and blue-tinted white (#e6f3ff)
  - Status colors: Terminal green, amber, red, orange, purple
✓ **Enhanced CRT Effects**: 
  - Scan lines with customizable opacity
  - CRT flicker animations with contrast/brightness adjustments
  - Vignette effects and screen glow
  - Chromatic aberration simulation
✓ **Improved Glow Effects**: Enhanced phosphor glow with multiple shadow layers and pulsing animations
✓ **Typing Animations**: Added typewriter effects for progressive text rendering
  - .typing-text class with customizable speeds (fast, normal, slow)
  - .typewriter-line for line-by-line ASCII art rendering
✓ **Button Enhancement**: Redesigned all buttons with rounded corners and vintage styling
  - .terminal-button class with gradient backgrounds and hover effects
  - Animated shine effects and enhanced glow on interaction
✓ **System Information Display**: Created new SystemInfoPane component
  - Fast-rendering ASCII art with Mac system information
  - Real-time system stats and uptime display
  - Grid-based layout with vintage terminal styling
✓ **Enhanced Pane Styling**: Updated all panes with improved borders, backgrounds, and effects
  - Better contrast and readability
  - Consistent rounded corners throughout
  - Enhanced visual hierarchy

## Technical Improvements

✓ **Animation System**: Comprehensive keyframe animations for all CRT effects
✓ **CSS Variables**: Organized color system with semantic naming
✓ **Component Updates**: Enhanced StatusPane, FeaturedPane, BlogPane, and TerminalPane
✓ **Accessibility**: Maintained all accessibility features while enhancing visual appeal
✓ **Performance**: Optimized animations with proper GPU acceleration
