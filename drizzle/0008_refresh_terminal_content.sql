-- Refresh terminal command templates with iconography enhancements

UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Hello, World")}}

My name is {{ansi.magenta("Tulio Cunha")}}, I am a full-stack developer passionate about what I do. I spend most of my days tinkering with low and high level programming to solve my problems, and yours, if you let me! {{ansi.green("[[icon:lucide/ghost|Terminal avatar]]")}}

{{ansi.cyan("[[icon:lucide/github|GitHub]]")}} {{ansi.link("https://github.com/tuliopc23", "github.com/tuliopc23")}}
{{ansi.cyan("[[icon:lucide/hammer|Status]]")}} Building amazing things {{ansi.yellow("[[icon:lucide/bolt|Lightning energy]]")}}',
    updated_at = CURRENT_TIMESTAMP
WHERE command IN ('whoami', 'info');
--> statement-breakpoint

UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Welcome! type those words and press enter to:")}}

{{ansi.magenta("[[icon:lucide/user-round|About me]]")}}
  {{ansi.green("whoami")}} or {{ansi.green("info")}} - Learn who I am

{{ansi.magenta("[[icon:lucide/folder|Projects]]")}}
  {{ansi.green("ls")}} or {{ansi.green("projects")}} - Browse highlighted work
  {{ansi.green("grep")}} or {{ansi.green("skills")}} - Explore my tech stack

{{ansi.magenta("[[icon:lucide/mail|Connect]]")}}
  {{ansi.green("gh")}} or {{ansi.green("github")}} - Jump to my GitHub profile
  {{ansi.green("contact")}} - Grab my email or schedule a chat
  {{ansi.green("open")}} - Visit any route or external link

{{ansi.magenta("[[icon:lucide/terminal|Terminal]]")}}
  {{ansi.green("clear")}} - Clear the terminal history
  {{ansi.green("Ctrl+L")}} - Keyboard shortcut to clear the screen
  {{ansi.green("Tab")}} - Autocomplete any command',
    updated_at = CURRENT_TIMESTAMP
WHERE command = 'help';
--> statement-breakpoint

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

UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Tech Stack [[icon:lucide/hammer|Tech Stack]]")}}

{{ansi.magenta("[[icon:lucide/sparkles|Highlights]]")}}
  {{ansi.gray("[[icon:simple/swift|Swift]] [[icon:simple/go|Go]] [[icon:simple/rust|Rust]] [[icon:simple/zig|Zig]] [[icon:simple/typescript|TypeScript]] [[icon:simple/python|Python]]")}}

{{ansi.magenta("[[icon:lucide/palette|Apple Platforms]]")}}
  {{ansi.gray("[[icon:simple/swift|SwiftUI]] [[icon:lucide/apple|macOS]] [[icon:lucide/apple|iOS]]")}}

{{ansi.magenta("[[icon:lucide/wrench|System Programming]]")}}
  {{ansi.gray("[[icon:lucide/wrench|Dev tools]] [[icon:lucide/terminal-square|CLI tools]]")}}

{{ansi.magenta("[[icon:lucide/list|Web Backend]]")}}
  {{ansi.gray("[[icon:simple/gin|Gin]] [[icon:simple/hono|Hono]] [[icon:simple/vapor|Vapor]] [[icon:simple/actix|Actix]] [[icon:simple/fastify|Fastify]]")}}

{{ansi.magenta("[[icon:lucide/list|Web Frontend]]")}}
  {{ansi.gray("[[icon:simple/react|React]] [[icon:simple/svelte|Svelte]] [[icon:simple/vuedotjs|Vue]] [[icon:simple/solid|Solid]] [[icon:simple/tailwindcss|Tailwind CSS]]")}}

{{ansi.magenta("[[icon:lucide/tree-palm|Meta Frameworks]]")}}
  {{ansi.gray("[[icon:lucide/tree-palm|TanStack Start]] [[icon:simple/remix|Remix]] [[icon:simple/nextdotjs|Next.js]] [[icon:simple/nuxt|Nuxt]] [[icon:simple/svelte|SvelteKit]]")}}

{{ansi.magenta("[[icon:lucide/list|JavaScript Runtimes]]")}}
  {{ansi.gray("[[icon:simple/bun|Bun]] [[icon:simple/nodedotjs|Node.js]] [[icon:simple/deno|Deno]]")}}

{{ansi.magenta("[[icon:lucide/list|Cloud Native]]")}}
  {{ansi.gray("[[icon:simple/docker|Docker]] [[icon:simple/podman|Podman]] [[icon:simple/terraform|Terraform]]")}}',
    updated_at = CURRENT_TIMESTAMP
WHERE command IN ('grep', 'skills');
--> statement-breakpoint
