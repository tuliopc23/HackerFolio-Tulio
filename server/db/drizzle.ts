import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), 'database')
const DB_PATH = join(DATA_DIR, 'portfolio.db')

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

export const sqlite = new Database(DB_PATH, { create: true, readwrite: true })
sqlite.exec('PRAGMA journal_mode = WAL;')

export const orm = drizzle(sqlite)

