import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import { sqlite } from './drizzle'

await migrate(sqlite, { migrationsFolder: 'drizzle' })
console.log('Migrations applied')

