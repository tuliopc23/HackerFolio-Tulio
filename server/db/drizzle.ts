import { Database } from 'bun:sqlite'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

import * as schema from './schema'

const DATA_DIR = join(process.cwd(), 'database')
const DB_PATH = join(DATA_DIR, 'portfolio.db')

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

export const sqlite = new Database(DB_PATH, { create: true, readwrite: true })
sqlite.run('PRAGMA journal_mode = WAL;')

export const orm: BunSQLiteDatabase<typeof schema> = drizzle(sqlite, { schema })
