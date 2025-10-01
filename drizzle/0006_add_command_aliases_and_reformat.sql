-- Migration: Add command aliases and reformat all command outputs
-- Date: 2025-10-01

-- Update help command with conversational format (no section headers)
UPDATE terminal_commands
SET response_template = 'Type {{ansi.green("whoami")}} or {{ansi.green("info")}} to get information about me!
Type {{ansi.green("ls")}} or {{ansi.green("projects")}} to get a list of my recent personal projects
Type {{ansi.green("grep")}} or {{ansi.green("skills")}} to get a list of my software development abilities
Type {{ansi.green("gh")}} or {{ansi.green("github")}} to get my GH profile link
Type {{ansi.green("open")}} to navigate to www.tuliocunha.dev
Type {{ansi.green("contact")}} for my email and booking link
Type {{ansi.green("clear")}} to clear the terminal',
    updated_at = CURRENT_TIMESTAMP
WHERE command = 'help';

-- Update whoami command with hyperlinked GitHub
UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Hello, World")}}

My name is {{ansi.magenta("Tulio Cunha")}}, I am a full-stack developer passionate about what I do. I spend most of my days tinkering with low and high level programming to solve my problems, and yours, if you let me! {{ansi.green("👻")}}

{{ansi.cyan("GitHub")}}: {{ansi.link("https://github.com/tuliopc23", "github.com/tuliopc23")}}
{{ansi.cyan("Status")}}: Building amazing things ⚡',
    updated_at = CURRENT_TIMESTAMP
WHERE command = 'whoami';

-- Update contact command with hyperlinked email and booking
UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Get in Touch")}}

📧 {{ansi.cyan("Email")}}: {{ansi.link("mailto:contact@tuliocunha.dev", "contact@tuliocunha.dev")}}
💼 {{ansi.cyan("LinkedIn")}}: {{ansi.link("https://linkedin.com/in/tuliopinheirocunha", "linkedin.com/in/tuliopinheirocunha")}}
📆 {{ansi.cyan("Book a Meeting")}}: {{ansi.link("https://fantastical.app/tuliocunha", "fantastical.app/tuliocunha")}}',
    updated_at = CURRENT_TIMESTAMP
WHERE command = 'contact';

-- Update gh command with hyperlinked GitHub and cleaner format
UPDATE terminal_commands
SET response_template = '{{ansi.cyan("GitHub Profile")}}

{{ansi.link("https://github.com/tuliopc23", "github.com/tuliopc23")}}

Feel free to contribute or open an issue on any project! ⋔',
    updated_at = CURRENT_TIMESTAMP
WHERE command = 'gh';

-- Update grep command with cleaner formatting
UPDATE terminal_commands
SET response_template = '{{ansi.cyan("Technical Stack")}}

{{ansi.magenta("Languages")}}: Swift, Go, Rust, Zig, TypeScript, Python
{{ansi.magenta("MacOS & iOS Apps")}}: SwiftUI, AppKit, UIKit
{{ansi.magenta("System''s Programming")}}: Developer Tools, Cli Tools
{{ansi.magenta("Web Backend")}}: Fiber, Gin, Actix, Actum, Elysia, Hono, Nitro, Fastify...
{{ansi.magenta("Web Frontend")}}: React, Svelte, Vue, Solid, Modern CSS
{{ansi.magenta("Web Meta Frameworks")}}: Tanstack Start, Remix, Next, Nuxt, Sveltekit
{{ansi.magenta("JS Runtimes")}}: Bun, Node, Deno
{{ansi.magenta("Cloud Native")}}: Docker, Podman, Apple Containers, Terraform, DevOps...',
    updated_at = CURRENT_TIMESTAMP
WHERE command = 'grep';

-- Deactivate cat command
UPDATE terminal_commands
SET is_active = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE command = 'cat';

-- Insert alias commands (info, projects, skills, github)
INSERT INTO terminal_commands (command, description, category, response_template, is_active, template_variables, created_at, updated_at)
VALUES 
    ('info', 'Show about me information', 'info', '{{ansi.cyan("Hello, World")}}

My name is {{ansi.magenta("Tulio Cunha")}}, I am a full-stack developer passionate about what I do. I spend most of my days tinkering with low and high level programming to solve my problems, and yours, if you let me! {{ansi.green("👻")}}

{{ansi.cyan("GitHub")}}: {{ansi.link("https://github.com/tuliopc23", "github.com/tuliopc23")}}
{{ansi.cyan("Status")}}: Building amazing things ⚡', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('projects', 'List all projects with click hints', 'navigation', '{{ansi.cyan("Recent Projects")}}

{{#each projects}}
• {{ansi.link(this.github_url, ansi.magenta(this.name))}} - {{this.short_description}}
{{/each}}

{{ansi.gray("Click any project name to view details")}}', true, 'projects', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('skills', 'Display technical skills and stack', 'info', '{{ansi.cyan("Technical Stack")}}

{{ansi.magenta("Languages")}}: Swift, Go, Rust, Zig, TypeScript, Python
{{ansi.magenta("MacOS & iOS Apps")}}: SwiftUI, AppKit, UIKit
{{ansi.magenta("System''s Programming")}}: Developer Tools, Cli Tools
{{ansi.magenta("Web Backend")}}: Fiber, Gin, Actix, Actum, Elysia, Hono, Nitro, Fastify...
{{ansi.magenta("Web Frontend")}}: React, Svelte, Vue, Solid, Modern CSS
{{ansi.magenta("Web Meta Frameworks")}}: Tanstack Start, Remix, Next, Nuxt, Sveltekit
{{ansi.magenta("JS Runtimes")}}: Bun, Node, Deno
{{ansi.magenta("Cloud Native")}}: Docker, Podman, Apple Containers, Terraform, DevOps...', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    
    ('github', 'Display Github Profile URL', 'navigation', '{{ansi.cyan("GitHub Profile")}}

{{ansi.link("https://github.com/tuliopc23", "github.com/tuliopc23")}}

Feel free to contribute or open an issue on any project! ⋔', true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
