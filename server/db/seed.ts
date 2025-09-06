import { sql } from 'drizzle-orm'

import { orm } from './drizzle'
import { terminalCommands as tCommands } from './schema'

async function ensureSeed() {
  try {
    console.log('🌱 Checking terminal_commands seed...')
    const countRes = await orm
      .select({ c: sql`count(*)`.mapWith(Number) })
      .from(tCommands)
      .limit(1)
    const count = countRes.at(0)?.c ?? 0

    if (count > 0) {
      console.log(`✅ Seed already present (${count.toString()} commands). Skipping.`)
      return
    }

    console.log('🧩 Seeding baseline terminal commands...')

    // Minimal baseline so help/projects work even if migrations didn't seed
    const statements = [
      sql`INSERT INTO terminal_commands (command, description, category, is_active) VALUES ('help','Display available commands','info',1) ON CONFLICT(command) DO NOTHING`,
      sql`INSERT INTO terminal_commands (command, description, category, is_active) VALUES ('projects','List all projects','projects',1) ON CONFLICT(command) DO NOTHING`,
      sql`INSERT INTO terminal_commands (command, description, category, is_active) VALUES ('clear','Clear terminal screen','system',1) ON CONFLICT(command) DO NOTHING`,
      sql`INSERT INTO terminal_commands (command, description, category, response_template, is_active) VALUES ('stack','Display technical stack','info', '{{ansi.cyan("React, TypeScript, Bun, Elysia, Drizzle, SQLite")}}',1) ON CONFLICT(command) DO NOTHING`,
      sql`INSERT INTO terminal_commands (command, description, category, response_template, is_active) VALUES ('time','Show current time','system', 'Time: {{currentTime}} ({{timezone}}) • Unix: {{unixTime}}',1) ON CONFLICT(command) DO NOTHING`,
      sql`INSERT INTO terminal_commands (command, description, category, response_template, is_active) VALUES ('open','Open route or URL','navigation', '{{handleOpenCommand(args[0])}}',1) ON CONFLICT(command) DO NOTHING`,
      sql`INSERT INTO terminal_commands (command, description, category, response_template, is_active) VALUES ('theme','Switch terminal theme','system', '{{handleThemeCommand(args[0])}}',1) ON CONFLICT(command) DO NOTHING`,
      sql`INSERT INTO terminal_commands (command, description, category, response_template, is_active) VALUES ('cat','Show project details','filesystem', '{{handleCatFile(args[0])}}',1) ON CONFLICT(command) DO NOTHING`,
    ]

    for (const s of statements) {
      orm.run(s)
    }

    const after = await orm
      .select({ c: sql`count(*)`.mapWith(Number) })
      .from(tCommands)
      .limit(1)
    console.log(`✅ Seed complete (${(after.at(0)?.c ?? 0).toString()} commands).`)
  } catch (error) {
    console.error('❌ Seed error:', error)
  }
}

void ensureSeed()
