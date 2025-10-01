-- Update terminal command templates to use icon tokens and remove emoji references

UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Projects Portfolio")}}

{{ansi.magenta("[[icon:lucide/list|Project]] LiqUIdify")}}
  {{ansi.dim("Apple Design Language inspired React component library")}}
  {{ansi.gray("[[icon:simple/react|React]] [[icon:simple/bun|Bun]] [[icon:simple/vite|Vite]] [[icon:simple/tailwindcss|Tailwind CSS]]")}}

{{ansi.magenta("[[icon:lucide/list|Project]] HackerFolio")}}
  {{ansi.dim("Terminal inspired portfolio experience")}}
  {{ansi.gray("[[icon:simple/react|React]] [[icon:simple/reactrouter|TanStack Router]] [[icon:simple/bun|Bun]] [[icon:simple/drizzle|Drizzle ORM]] [[icon:lucide/route|Elysia]]")}}

{{ansi.magenta("[[icon:lucide/list|Project]] Switchify")}}
  {{ansi.dim("SwiftUI utility for lightning-fast app switching")}}
  {{ansi.gray("[[icon:simple/swift|Swift]] [[icon:lucide/apple|Apple platform]]")}}

{{ansi.magenta("[[icon:lucide/list|Project]] Cockpit")}}
  {{ansi.dim("Cmd+K productivity command center for macOS and iPadOS")}}
  {{ansi.gray("[[icon:simple/swift|Swift]] [[icon:lucide/apple|Apple platform]]")}}

{{ansi.magenta("[[icon:lucide/list|Project]] A-Hackers-Brand")}}
  {{ansi.dim("SvelteKit design system with a hacker aesthetic")}}
  {{ansi.gray("[[icon:simple/bun|Bun]] [[icon:simple/svelte|Svelte]] [[icon:simple/tailwindcss|Tailwind CSS]]")}}

{{ansi.magenta("[[icon:lucide/list|Project]] Coming Soon")}}
  {{ansi.dim("Mac-first concept for a new terminal experience")}}
  {{ansi.gray("[[icon:lucide/apple|Apple platform]] [[icon:lucide/terminal|Terminal interface]]")}}

{{ansi.magenta("[[icon:lucide/list|Project]] Swifget-CLI")}}
  {{ansi.dim("Swift powered download manager and HTTP client")}}
  {{ansi.gray("[[icon:simple/swift|Swift]] [[icon:lucide/terminal|Terminal interface]]")}}

{{ansi.yellow("[[icon:lucide/lightbulb|Tip]]")}} Use {{ansi.green("projects --help")}} to explore filters and pagination',
    updated_at = CURRENT_TIMESTAMP
WHERE command = 'ls';
--> statement-breakpoint

