import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

import { orm } from './drizzle'

function runMigrations() {
  console.log('Running database migrations...')
  try {
    migrate(orm, { migrationsFolder: 'drizzle' })
    console.log('Migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()
