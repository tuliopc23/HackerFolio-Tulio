-- Add all static commands from client-side to database with rich templates

-- First, update existing commands with better templates
UPDATE terminal_commands 
SET response_template = '{{ansi.cyan("Name")}}: Tulio Pinheiro Cunha
{{ansi.cyan("Role")}}: Full-Stack Developer  
{{ansi.cyan("Location")}}: Rio de Janeiro, Brazil
{{ansi.cyan("GitHub")}}: https://github.com/tuliopinheirocunha
{{ansi.cyan("Status")}}: Building amazing things ⚡',
    examples = '["whoami"]',
    aliases = '["who", "me"]',
    metadata = '{"type": "profile", "responseType": "formatted"}'
WHERE command = 'whoami';

-- Add all client-side commands to database
INSERT OR REPLACE INTO terminal_commands (
  command, 
  description, 
  category, 
  response_template, 
  examples, 
  aliases, 
  argument_schema, 
  metadata,
  is_active
) VALUES

-- System commands
('clear', 'Clear terminal output', 'system', 'CLEAR', '["clear"]', '["cls"]', '{}', '{"type": "system", "special": true}', 1),

-- File system commands  
('ls', 'List available content', 'filesystem', 'about.md
contact.md  
resume.md
projects/
  terminal-portfolio/
  ecommerce-platform/
  rust-cli-tool/
  mobile-trading-app/', '["ls"]', '["list", "dir"]', '{}', '{"type": "filesystem"}', 1),

('cat', 'Display file content', 'filesystem', '{{handleCatFile(args[0])}}', '["cat about.md", "cat contact.md", "cat resume.md"]', '["type", "show"]', '{"args": [{"name": "filename", "type": "string", "required": true, "options": ["about.md", "contact.md", "resume.md"]}]}', '{"type": "filesystem", "requiresArgs": true}', 1),

-- Navigation commands
('open', 'Navigate to route or open URL', 'navigation', '{{handleOpenCommand(args[0])}}', '["open /projects", "open /about", "open https://github.com"]', '[]', '{"args": [{"name": "target", "type": "string", "required": true, "description": "Route path or URL to open"}]}', '{"type": "navigation", "requiresArgs": true}', 1),

-- Theme commands
('theme', 'Switch terminal theme', 'system', '{{handleThemeCommand(args[0])}}', '["theme oxocarbon"]', '[]', '{"args": [{"name": "themeName", "type": "string", "required": true, "options": ["oxocarbon"]}]}', '{"type": "system", "requiresArgs": true}', 1),

-- Info commands with better templates
('stack', 'Display technical skills and stack', 'info', '{{ansi.cyan("Technical Stack")}}

{{ansi.magenta("Frontend")}}:
• React, TypeScript, Next.js
• Tailwind CSS, Framer Motion
• Vite, SWC

{{ansi.magenta("Backend")}}:
• Node.js, Elysia, Express
• PostgreSQL, SQLite, Drizzle ORM
• REST APIs, WebSockets

{{ansi.magenta("Tools & DevOps")}}:
• Git, Docker, Vercel
• ESLint, Prettier, Vitest
• Bun, npm, pnpm', '["stack"]', '["tech", "skills"]', '{}', '{"type": "info", "responseType": "formatted"}', 1),

('time', 'Display current time', 'system', '{{ansi.cyan("Current Time")}}: {{currentTime}}
{{ansi.cyan("Timezone")}}: {{timezone}}
{{ansi.cyan("Unix Timestamp")}}: {{unixTime}}', '["time"]', '["date", "now"]', '{}', '{"type": "system", "dynamic": true}', 1);

-- Update created_at and updated_at for new commands
UPDATE terminal_commands 
SET 
  created_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL;