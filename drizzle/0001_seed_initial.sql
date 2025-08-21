-- Seed initial data for projects if empty
INSERT INTO projects (name, description, tech_stack, github_url, live_url, status)
SELECT 'Terminal Portfolio',
       'A vintage CRT-inspired portfolio website with interactive terminal interface.',
       json('["React", "TypeScript", "Tailwind"]'),
       'https://github.com/tuliocunha/terminal-portfolio',
       'https://portfolio.tuliocunha.dev',
       'active'
WHERE NOT EXISTS (SELECT 1 FROM projects);

-- Seed portfolio content sections if missing
INSERT INTO portfolio_content (section, content)
VALUES
  ('about', json('{"markdown": "# About Me\\n\\nFull-stack developer."}')),
  ('skills', json('{"list": ["React", "TypeScript", "Bun", "Elysia"]}')),
  ('experience', json('{"items": []}')),
  ('contact', json('{"email":"tulio@example.com","github":"https://github.com/tuliopc23","linkedin":"https://www.linkedin.com/in/tuliocunha/","twitter":"https://twitter.com/tuliopc"}'))
ON CONFLICT(section) DO NOTHING;

-- Seed terminal commands if missing (idempotent)
INSERT INTO terminal_commands (command, description, category)
VALUES
  ('help', 'Display available commands', 'info'),
  ('about', 'Show about me information', 'info'),
  ('projects', 'List all projects', 'projects'),
  ('skills', 'Display technical skills', 'info'),
  ('contact', 'Show contact information', 'info'),
  ('clear', 'Clear terminal screen', 'navigation')
ON CONFLICT(command) DO NOTHING;

INSERT INTO terminal_commands (command, description, category, response_template)
VALUES
  ('github', 'Open GitHub profile', 'info', 'https://github.com/tuliopc23'),
  ('resume', 'Download resume', 'info', 'https://example.com/resume.pdf')
ON CONFLICT(command) DO NOTHING;

