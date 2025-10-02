-- Migration: Refine terminal output icons
-- Replace text labels with contextual icons for cleaner terminal UI

-- Update whoami command: replace "GitHub:" with link icon, "Status:" with hammer icon
UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Hello, World")}}

My name is {{ansi.magenta("Tulio Cunha")}}, I am a full-stack developer passionate about what I do. I spend most of my days tinkering with low and high level programming to solve my problems, and yours, if you let me! {{ansi.green("[[icon:lucide/ghost|Terminal avatar]]")}}

{{ansi.yellow("[[icon:lucide/link|GitHub link]]")}}: {{ansi.link("https://github.com/tuliopc23", "github.com/tuliopc23")}}
{{ansi.yellow("[[icon:lucide/hammer|Status]]")}}: Building amazing things {{ansi.yellow("[[icon:lucide/bolt|Lightning energy]]")}}'
WHERE command = 'whoami';

-- Update help command: remove emoji tip, update heading, replace section headers with icons
UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Welcome! Here''s how to explore my portfolio:")}}

{{ansi.yellow("[[icon:lucide/user-round|About]]")}} {{ansi.magenta("About Me")}}
  {{ansi.green("whoami")}} or {{ansi.green("info")}} - Learn about who I am and what I do

{{ansi.yellow("[[icon:lucide/briefcase|Work]]")}} {{ansi.magenta("My Work")}}
  {{ansi.green("ls")}} or {{ansi.green("projects")}} - Browse my recent projects
  {{ansi.green("grep")}} or {{ansi.green("skills")}} - View my technical skills

{{ansi.yellow("[[icon:lucide/link|Connect]]")}} {{ansi.magenta("Connect")}}
  {{ansi.green("gh")}} or {{ansi.green("github")}} - Visit my GitHub profile
  {{ansi.green("contact")}} - Get my email and booking link
  {{ansi.green("open")}} - Visit my website

{{ansi.yellow("[[icon:lucide/terminal|Terminal]]")}} {{ansi.magenta("Terminal")}}
  {{ansi.green("clear")}} - Clear the terminal screen
  {{ansi.green("Ctrl+L")}} - Keyboard shortcut to clear'
WHERE command = 'help';

-- Update ls command: change numbered list to bullet list with dot icons
UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Projects Portfolio")}}

{{ansi.yellow("[[icon:lucide/dot|Bullet]]")}} {{ansi.magenta("LiqUIdify")}}
   A Apple Design Language Inspired production ready React component Library
   {{ansi.dim("Stack: [[icon:simple/react|React]] [[icon:simple/bun|Bun]] [[icon:simple/vite|Vite]] [[icon:simple/tailwindcss|Tailwind CSS]]")}}

{{ansi.yellow("[[icon:lucide/dot|Bullet]]")}} {{ansi.magenta("HackerFolio")}}
   This Terminal inspired portfolio
   {{ansi.dim("Stack: [[icon:simple/react|React]] [[icon:simple/reactrouter|TanStack Router]] [[icon:simple/bun|Bun]] [[icon:simple/drizzle|Drizzle ORM]] [[icon:lucide/route|Elysia]]")}}

{{ansi.yellow("[[icon:lucide/dot|Bullet]]")}} {{ansi.magenta("Switchify")}}
   Native SwiftUI, Blazingly Fast App Switcher
   {{ansi.dim("Stack: [[icon:simple/swift|Swift]] [[icon:lucide/apple|Apple platform]]")}}

{{ansi.yellow("[[icon:lucide/dot|Bullet]]")}} {{ansi.magenta("Cockpit")}}
   A Cmd-k Productivity Powerhouse App for Mac and iPad
   {{ansi.dim("Stack: [[icon:simple/swift|Swift]] [[icon:lucide/apple|Apple platform]]")}}

{{ansi.yellow("[[icon:lucide/dot|Bullet]]")}} {{ansi.magenta("A-Hackers-Brand")}}
   A SvelteKit design system that leverages hacker/terminal aesthetics on the web
   {{ansi.dim("Stack: [[icon:simple/bun|Bun]] [[icon:simple/svelte|Svelte]] [[icon:simple/tailwindcss|Tailwind CSS]]")}}

{{ansi.yellow("[[icon:lucide/dot|Bullet]]")}} {{ansi.magenta("Coming Soon")}}
   A macOS centric new concept of terminal app
   {{ansi.dim("Stack: [[icon:lucide/apple|Apple platform]] [[icon:lucide/terminal|Terminal interface]]")}}

{{ansi.yellow("[[icon:lucide/dot|Bullet]]")}} {{ansi.magenta("Swifget-CLI")}}
   Download manager utility and HTTP client built in Swift integrating beautifully with the macOS environment
   {{ansi.dim("Stack: [[icon:simple/swift|Swift]] [[icon:lucide/terminal|Terminal interface]]")}}

{{ansi.yellow("[[icon:lucide/lightbulb|Tip icon]] Tip")}}: Use {{ansi.green("projects --help")}} to explore filters and pagination'
WHERE command = 'ls';

-- Update grep command: abbreviate heading to "Tech Stack", replace all labels with icon-only tokens
UPDATE terminal_commands
SET response_template = '{{ansi.cyan("[[icon:lucide/hammer|Tech Stack]]")}} {{ansi.cyan("Tech Stack")}}

{{ansi.magenta("Languages")}}: [[icon:simple/swift|Swift]] [[icon:simple/go|Go]] [[icon:simple/rust|Rust]] [[icon:simple/zig|Zig]] [[icon:simple/typescript|TypeScript]] [[icon:simple/python|Python]]
{{ansi.magenta("MacOS & iOS Apps")}}: SwiftUI, AppKit, UIKit
{{ansi.magenta("System''s Programming")}}: Developer Tools, Cli Tools
{{ansi.magenta("Web Backend")}}: [[icon:simple/gin|Gin]] [[icon:simple/actix|Actix]] [[icon:simple/hono|Hono]] [[icon:simple/fastify|Fastify]] [[icon:simple/vapor|Vapor]]
{{ansi.magenta("Web Frontend")}}: [[icon:simple/react|React]] [[icon:simple/svelte|Svelte]] [[icon:simple/vuedotjs|Vue]] [[icon:simple/solid|Solid]]
{{ansi.magenta("Web Meta Frameworks")}}: [[icon:simple/remix|Remix]] [[icon:simple/nextdotjs|Next.js]] [[icon:simple/nuxt|Nuxt]]
{{ansi.magenta("JS Runtimes")}}: [[icon:simple/bun|Bun]] [[icon:simple/nodedotjs|Node]] [[icon:simple/deno|Deno]]
{{ansi.magenta("Cloud Native")}}: [[icon:simple/docker|Docker]] [[icon:simple/podman|Podman]] [[icon:simple/terraform|Terraform]]'
WHERE command = 'grep';
