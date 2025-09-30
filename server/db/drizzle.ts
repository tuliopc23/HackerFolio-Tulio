import { Database } from 'bun:sqlite'
import { resolve } from 'path'

import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

import * as schema from './schema'

// Simpler: bundled DB path relative to project root
const DB_PATH = resolve(process.cwd(), './database/portfolio.db')

export const sqlite = new Database(DB_PATH, { create: false, readwrite: true })
sqlite.run('PRAGMA journal_mode = WAL;')

console.log(`📦 Using database: ${DB_PATH}`)

export const orm: BunSQLiteDatabase<typeof schema> = drizzle(sqlite, { schema })
