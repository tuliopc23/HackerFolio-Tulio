-- Index to speed up active commands filtering
CREATE INDEX IF NOT EXISTS idx_terminal_commands_active
ON terminal_commands(is_active);

