import { and, desc, eq } from 'drizzle-orm'
import { Elysia, type Context } from 'elysia'

import { orm } from '../db/drizzle'
import {
  terminalCommands as tCommands,
  projects as tProjects,
  selectTerminalCommandSchema,
  terminalCommandQuerySchema,
  type TerminalCommand,
} from '../db/schema'
import {
  createTerminalError,
  createDatabaseError,
  handleApiError,
  validateApiQuery,
  validateApiBody,
  ApiError,
} from '../lib/error-handling'
import {
  rateLimit,
  terminalRateLimitOptions,
  InputSanitizer,
  SecurityLogger,
  getClientId,
} from '../lib/security'
import { validateData, executeCommandSchema } from '../lib/validation'
import { ansi, parseStringArray } from '../utils/terminal'

// Terminal rate limiting middleware
const terminalRateLimit = (context: Context) => {
  const rateLimitPassed = rateLimit(terminalRateLimitOptions)(context)

  if (!rateLimitPassed) {
    SecurityLogger.log({
      type: 'rate_limit',
      clientId: getClientId(context),
      timestamp: Date.now(),
      details: {
        endpoint: 'terminal',
        command: 'rate_limited',
      },
    })

    throw new Error('Command rate limit exceeded, please slow down')
  }

  return {} // Elysia derive expects object or void
}

export const terminalRoutes = new Elysia({ prefix: '/api' })
  .onError(({ error }) => handleApiError(error))
  .derive(terminalRateLimit)
  .get('/commands', async (context: Context) => {
    try {
      const query = validateApiQuery(terminalCommandQuerySchema, context)

      const queryBuilder = orm
        .select()
        .from(tCommands)
        .where(
          query.category
            ? and(eq(tCommands.isActive, true), eq(tCommands.category, query.category))
            : eq(tCommands.isActive, true)
        )
        .orderBy(tCommands.command)

      const rows = await queryBuilder

      // Validate the database results
      const validatedCommands: TerminalCommand[] = rows.map((row: unknown) =>
        validateData(selectTerminalCommandSchema, row)
      )

      return validatedCommands
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw createDatabaseError('Failed to fetch commands', error)
    }
  })
  .post('/commands/execute', async (context: Context) => {
    try {
      const { command, args } = validateApiBody(executeCommandSchema, context)

      // Sanitize command input for security
      const sanitizedCommand = InputSanitizer.sanitizeCommand(command)
      const sanitizedArgs = Array.isArray(args)
        ? args.map(arg =>
            typeof arg === 'string' ? InputSanitizer.sanitizeString(arg, 100) : String(arg)
          )
        : []

      // Log suspicious commands
      const suspiciousPatterns = [
        /rm\s+-rf/,
        /curl\s+.*\|\s*sh/,
        /wget\s+.*\|\s*sh/,
        /eval\s*\(/,
        /__import__/,
        /exec\(/,
        /system\(/,
        /shell_exec/,
      ]

      if (suspiciousPatterns.some(pattern => pattern.test(command))) {
        SecurityLogger.log({
          type: 'suspicious_request',
          clientId: getClientId(context),
          timestamp: Date.now(),
          details: {
            command: sanitizedCommand,
            originalCommand: command.slice(0, 100),
          },
        })
      }

      // Basic command lookup (allows toggling via is_active)
      const found = (
        await orm.select().from(tCommands).where(eq(tCommands.command, sanitizedCommand)).limit(1)
      ).at(0)

      if (!found) {
        return createTerminalError(ansi.red(`Command not found: ${sanitizedCommand}`))
      }

      switch (sanitizedCommand) {
        case 'help': {
          const cmds = await orm
            .select({
              command: tCommands.command,
              description: tCommands.description,
              category: tCommands.category,
            })
            .from(tCommands)
            .where(eq(tCommands.isActive, true))
            .orderBy(tCommands.command)

          const argsArr = Array.isArray(args) ? args : []
          const target = (argsArr[0] ?? '').toLowerCase()

          // Detailed help per command
          if (target) {
            const usage: Record<string, { desc: string; usage: string; examples?: string[] }> = {
              help: {
                desc: 'Show general or command-specific help',
                usage: 'help [command]',
                examples: ['help', 'help projects'],
              },
              projects: {
                desc: 'List projects with optional filter/flags',
                usage:
                  'projects [filter] [--limit N|--per N] [--page N] [--status STATUS] [--stack TECH]',
                examples: [
                  'projects',
                  'projects react --limit 5',
                  'projects --status active',
                  'projects --per 5 --page 2',
                ],
              },
              whoami: { desc: 'Display profile information', usage: 'whoami' },
              stack: { desc: 'Display technical skills list', usage: 'stack' },
              grep: { desc: 'Search helpers (stack supported)', usage: 'grep stack' },
              about: { desc: 'Show about content', usage: 'about' },
              skills: { desc: 'Show skills content', usage: 'skills' },
              contact: { desc: 'Show contact information', usage: 'contact' },
              github: { desc: 'Show GitHub profile link', usage: 'github' },
              resume: { desc: 'Show resume URL', usage: 'resume' },
              time: { desc: 'Show current time', usage: 'time' },
              clear: { desc: 'Clear terminal', usage: 'clear' },
            }
            const u = usage[target]
            if (!u) return createTerminalError(ansi.red(`No help for '${target}'`))
            const lines = [
              `${ansi.magenta(ansi.bold('Command'))}: ${ansi.cyan(target)}`,
              `${ansi.magenta('Description')}: ${u.desc}`,
              `${ansi.magenta('Usage')}: ${ansi.cyan(u.usage)}`,
            ]
            if (u.examples?.length) {
              lines.push(ansi.magenta('Examples') + ':')
              for (const ex of u.examples) lines.push('  ' + ansi.cyan(ex))
            }
            return { output: lines.join('\\n') }
          }

          // General grouped help
          const byCat: Record<string, Array<{ command: string; description: string | null }>> = {}
          for (const c of cmds) {
            const cat = c.category ?? 'misc'
            byCat[cat] ??= []
            byCat[cat].push({ command: c.command, description: c.description })
          }
          const sections: string[] = []
          const wrap = (txt: string, width: number, indent: string) => {
            const words = (txt || '').split(/\s+/)
            const lines: string[] = []
            let line = ''
            for (const word of words) {
              const next = line ? line + ' ' + word : word
              if (indent.length + next.length > width) {
                if (line) lines.push(line)
                line = word
              } else {
                line = next
              }
            }
            if (line) lines.push(line)
            return lines.map((l, i) => (i === 0 ? l : indent + l)).join('\\n')
          }
          for (const [cat, rows] of Object.entries(byCat)) {
            const col = Math.max(12, Math.min(22, ...rows.map(r => r.command.length)))
            const header =
              ansi.magenta(ansi.bold(cat.toUpperCase())) +
              '\\n' +
              ansi.cyan('COMMAND'.padEnd(col)) +
              '  ' +
              ansi.cyan('DESCRIPTION')
            const line = '-'.repeat(('COMMAND'.padEnd(col) + '  DESCRIPTION').length)
            const body = rows
              .map(r => {
                const left = ansi.cyan(r.command.padEnd(col))
                const right = wrap(r.description ?? '', 80, ' '.repeat(col + 2))
                const [first, ...rest] = right.split('\\n')
                return [left + '  ' + (first ?? ''), ...rest].join('\\n')
              })
              .join('\\n')
            sections.push(`${header}\\n${ansi.dim(line)}\\n${body}`)
          }
          return { output: sections.join('\\n\\n') }
        }

        case 'projects': {
          // Parse flags and free-text filter
          let filter = ''
          let per: number | null = null
          let limit: number | null = null // alias for per
          let page: number | null = null
          let status: string | null = null
          let stackFilter: string | null = null
          const tokens = sanitizedArgs
          for (let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if (!t) continue

            if (t === '--per' && tokens[i + 1]) {
              per = Number(tokens[++i]) || null
              continue
            }
            if (t.startsWith('--per=')) {
              per = Number(t.split('=')[1] ?? '') || null
              continue
            }
            if (t === '--page' && tokens[i + 1]) {
              page = Number(tokens[++i]) || null
              continue
            }
            if (t.startsWith('--page=')) {
              page = Number(t.split('=')[1] ?? '') || null
              continue
            }
            if (t === '--limit' && tokens[i + 1]) {
              limit = Number(tokens[++i]) || null
              continue
            }
            if (t.startsWith('--limit=')) {
              limit = Number(t.split('=')[1] ?? '') || null
              continue
            }
            if (t === '--status' && tokens[i + 1]) {
              status = tokens[++i] ?? ''
              status = status.toLowerCase()
              continue
            }
            if (t.startsWith('--status=')) {
              status = t.split('=')[1] ?? ''
              status = status.toLowerCase()
              continue
            }
            if (t === '--stack' && tokens[i + 1]) {
              stackFilter = tokens[++i] ?? ''
              stackFilter = stackFilter.toLowerCase()
              continue
            }
            if (t.startsWith('--stack=')) {
              stackFilter = t.split('=')[1] ?? ''
              stackFilter = stackFilter.toLowerCase()
              continue
            }
            filter += (filter ? ' ' : '') + t
          }
          filter = filter.toLowerCase().trim()
          const projects = await orm
            .select({
              name: tProjects.name,
              description: tProjects.description,
              tech_stack: tProjects.techStack,
              github_url: tProjects.githubUrl,
              live_url: tProjects.liveUrl,
              status: tProjects.status,
            })
            .from(tProjects)
            .orderBy(desc(tProjects.createdAt))
          // Type the projects properly based on the select query
          interface ProjectRow {
            name: string | null
            description: string | null
            tech_stack: string | null
            github_url: string | null
            live_url: string | null
            status: string | null
          }

          let list: ProjectRow[] = projects
          // Validate projects data using type guard
          function isValidProjectRow(data: unknown): data is ProjectRow {
            return (
              typeof data === 'object' &&
              data !== null &&
              (typeof (data as Record<string, unknown>).name === 'string' ||
                (data as Record<string, unknown>).name === null) &&
              (typeof (data as Record<string, unknown>).description === 'string' ||
                (data as Record<string, unknown>).description === null) &&
              (typeof (data as Record<string, unknown>).tech_stack === 'string' ||
                (data as Record<string, unknown>).tech_stack === null) &&
              (typeof (data as Record<string, unknown>).github_url === 'string' ||
                (data as Record<string, unknown>).github_url === null) &&
              (typeof (data as Record<string, unknown>).live_url === 'string' ||
                (data as Record<string, unknown>).live_url === null) &&
              (typeof (data as Record<string, unknown>).status === 'string' ||
                (data as Record<string, unknown>).status === null)
            )
          }

          list = projects.filter(isValidProjectRow)
          if (filter) {
            list = projects.filter((p: ProjectRow) => {
              const name = (p.name ?? '').toLowerCase()
              const desc = (p.description ?? '').toLowerCase()
              const stackArr: string[] =
                typeof p.tech_stack === 'string' && p.tech_stack.trim()
                  ? parseStringArray(p.tech_stack)
                  : []
              const stack = stackArr.join(' ').toLowerCase()
              return name.includes(filter) || desc.includes(filter) || stack.includes(filter)
            })
          }
          if (status) {
            list = list.filter((p: ProjectRow) => (p.status ?? '').toLowerCase() === status)
          }
          if (stackFilter) {
            list = list.filter((p: ProjectRow) => {
              const arr: string[] =
                typeof p.tech_stack === 'string' && p.tech_stack.trim()
                  ? parseStringArray(p.tech_stack)
                  : []
              return arr.some(x => x.toLowerCase().includes(stackFilter))
            })
          }
          if (list.length === 0)
            return {
              output: filter
                ? ansi.yellow(`No projects found matching '${filter}'`)
                : ansi.yellow('No projects found'),
            }

          // Pagination calculations
          const total = list.length
          const effPer = Math.max(1, Math.min(50, per ?? limit ?? 5))
          const totalPages = Math.max(1, Math.ceil(total / effPer))
          const effPage = Math.max(1, Math.min(page ?? 1, totalPages))
          const start = (effPage - 1) * effPer
          const end = Math.min(total, start + effPer)
          const pageItems = list.slice(start, end)

          const text = pageItems
            .map((p: ProjectRow) => {
              const stack = (p.tech_stack ? JSON.parse(p.tech_stack) : []) as string[]
              const parts = [
                `${ansi.magenta('•')} ${ansi.cyan(ansi.bold(String(p.name)))}`,
                p.description ? `  ${p.description}` : undefined,
                `  ${ansi.magenta('Stack')}: ${stack.length ? ansi.cyan(stack.join(', ')) : '-'}`,
                `  ${ansi.magenta('GitHub')}: ${p.github_url ? ansi.underline(ansi.cyan(p.github_url)) : '-'}`,
                `  ${ansi.magenta('Live')}: ${p.live_url ? ansi.underline(ansi.cyan(p.live_url)) : '-'}`,
                `  ${ansi.magenta('Status')}: ${ansi.cyan(p.status ?? '-')}`,
              ].filter(Boolean)
              return parts.join('\\n')
            })
            .join('\\n\\n')
          const baseFlags = [
            filter ? filter : '',
            status ? `--status ${status}` : '',
            stackFilter ? `--stack ${stackFilter}` : '',
            `--per ${String(effPer)}`,
          ]
            .filter(Boolean)
            .join(' ')
          const header = ansi.dim(
            `Page ${String(effPage)}/${String(totalPages)} • Showing ${String(start + 1)}-${String(end)} of ${String(total)}`
          )
          const hints: string[] = []
          if (effPage > 1)
            hints.push(
              `${ansi.magenta('Prev')}: ${ansi.cyan(`projects ${baseFlags} --page ${String(effPage - 1)}`)}`
            )
          if (effPage < totalPages)
            hints.push(
              `${ansi.magenta('Next')}: ${ansi.cyan(`projects ${baseFlags} --page ${String(effPage + 1)}`)}`
            )
          const footer = hints.length ? `\\n\\n${hints.join('\\n')}` : ''
          return { output: `${header}\\n\\n${text}${footer}` }
        }

        // Add other command cases here...
        case 'clear':
          // Frontend interprets CLEAR specially
          return { output: 'CLEAR' }

        default: {
          const foundCommand = found as { responseTemplate?: string }
          return {
            output: foundCommand.responseTemplate ?? ansi.green(`${sanitizedCommand} executed`),
          }
        }
      }
    } catch (error) {
      SecurityLogger.log({
        type: 'invalid_input',
        clientId: getClientId(context),
        timestamp: Date.now(),
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      return createTerminalError('Invalid command or arguments')
    }
  })
