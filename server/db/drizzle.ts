import { Database } from 'bun:sqlite'
import { resolve, isAbsolute, dirname, join } from 'path'
import { existsSync } from 'fs'

import { drizzle, type BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite'

import { env } from '../lib/env'

import * as schema from './schema'

// Resolve the database path robustly so it works from src or dist
const resolveDatabasePath = (): string => {
  const configured = env.DATABASE_URL

  // 1) Absolute path: use directly if it exists
  if (isAbsolute(configured) && existsSync(configured)) return configured

  // Helper to test a candidate relative to a base dir
  const from = (base: string, p: string) => resolve(base, p)

  // Try several common bases where the process might start from
  const bases = [
    process.cwd(),
    // When running from compiled output like dist/server/db/*.js
    // go up a few levels to project root
    // import.meta.dir points to this file's directory at runtime
    dirname(import.meta.dir), // server/db -> server
    dirname(dirname(import.meta.dir)), // server/db -> . (project root when running ts)
    dirname(dirname(dirname(import.meta.dir))), // dist/server/db -> dist/server
    dirname(dirname(dirname(dirname(import.meta.dir)))), // dist/server/db -> dist
  ]

  // Common relative forms people might set
  const rels = [configured, configured.replace(/^\.\/?/, ''), join('..', configured)]

  for (const base of bases) {
    for (const rel of rels) {
      const candidate = from(base, rel)
      if (existsSync(candidate)) return candidate
    }
    // Also try the known default location explicitly from various bases
    const defaultRel = './database/portfolio.db'
    const candidate = from(base, defaultRel)
    if (existsSync(candidate)) return candidate
  }

  // As a last resort, fall back to CWD resolution (won't create new DB)
  return resolve(process.cwd(), configured)
}

// Use the database path from environment with robust resolution
const DB_PATH = resolveDatabasePath()

export const sqlite = new Database(DB_PATH, { create: false, readwrite: true })
sqlite.run('PRAGMA journal_mode = WAL;')

console.log(`📦 Using database: ${DB_PATH}`)

export const orm: BunSQLiteDatabase<typeof schema> = drizzle(sqlite, { schema })
