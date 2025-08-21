-- Add new server-driven commands
INSERT INTO terminal_commands (command, description, category)
VALUES
  ('whoami', 'Display profile information', 'info'),
  ('stack', 'Display technical stack', 'info')
ON CONFLICT(command) DO NOTHING;

