import { Database } from 'bun:sqlite'
import { existsSync, mkdirSync } from 'fs'
import { dirname, isAbsolute, resolve } from 'path'

import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

import { dbConfig } from '../lib/env-config'

import * as schema from './schema'

// Resolve DB path: honor DATABASE_URL like file:./database/portfolio.db or absolute paths
function resolveDbPath(): string {
  const { url } = dbConfig
  const raw = url.startsWith('file:') ? url.replace(/^file:/, '') : url
  const p = isAbsolute(raw) ? raw : resolve(process.cwd(), raw)
  const dir = dirname(p)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return p
}

const DB_PATH = resolveDbPath()

export const sqlite = new Database(DB_PATH, { create: true, readwrite: true })
sqlite.run('PRAGMA journal_mode = WAL;')

// Helpful at runtime to confirm DB location
try {
  console.log(`📦 SQLite DB: ${DB_PATH}`)
} catch {
  // Ignore console errors
}

export const orm: BunSQLiteDatabase<typeof schema> = drizzle(sqlite, { schema })
