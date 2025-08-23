import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

import { orm } from './drizzle'

function runMigrations() {
  // eslint-disable-next-line no-console
  console.log('Running database migrations...')
  try {
    migrate(orm, { migrationsFolder: 'drizzle' })
    // eslint-disable-next-line no-console
    console.log('Migrations completed successfully')
    process.exit(0)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations()
