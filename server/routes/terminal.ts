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
  createDatabaseError,
  handleApiError,
  validateApiQuery,
  validateApiBody,
  ApiError,
} from '../lib/error-handling'
import { validateData, executeCommandSchema } from '../lib/validation'
import { createTemplateProcessor } from '../utils/template-processor'
import { ansi, parseStringArray } from '../utils/terminal'

const makeResult = (
  ok: boolean,
  command: string,
  output: string,
  opts: { startedAt?: number; errorText?: string } = {}
) => {
  const now = Date.now()
  const executionTime = opts.startedAt ? Math.max(0, now - opts.startedAt) : undefined
  return {
    success: ok,
    output,
    command,
    timestamp: now,
    ...(executionTime !== undefined ? { executionTime } : {}),
    ...(opts.errorText ? { error: opts.errorText } : {}),
  }
}

export const terminalRoutes = new Elysia({ prefix: '/api' })
  .onError(({ error }) => handleApiError(error))
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
    let currentCommand = ''
    try {
      const startedAt = Date.now()
      const { command, args } = validateApiBody(executeCommandSchema, context)

      // Basic input validation
      const sanitizedCommand = command.trim()
      currentCommand = sanitizedCommand
      const sanitizedArgs = Array.isArray(args)
        ? args.map(arg => (typeof arg === 'string' ? arg.trim() : String(arg)))
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
        console.log(`⚠️ Suspicious command blocked: ${command.slice(0, 50)}`)
        throw new Error('Command not allowed')
      }

      // Basic command lookup (allows toggling via is_active)
      const found = (
        await orm.select().from(tCommands).where(eq(tCommands.command, sanitizedCommand)).limit(1)
      ).at(0)

      if (!found) {
        return makeResult(
          false,
          sanitizedCommand,
          ansi.red(`Command not found: ${sanitizedCommand}`),
          {
            startedAt,
            errorText: 'NOT_FOUND',
          }
        )
      }

      switch (sanitizedCommand) {
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
            return makeResult(
              true,
              sanitizedCommand,
              filter
                ? ansi.yellow(`No projects found matching '${filter}'`)
                : ansi.yellow('No projects found'),
              { startedAt }
            )

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
              const parts = [
                `${ansi.magenta('•')} ${ansi.cyan(ansi.bold(String(p.name)))}`,
                p.description ? `  ${p.description}` : undefined,
                `  ${ansi.dim('Type')} ${ansi.cyan(`cat ${String(p.name).toLowerCase()}`)} ${ansi.dim('for details')}`,
              ].filter(Boolean)
              return parts.join('\n')
            })
            .join('\n\n')
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
          const footer = hints.length ? `\n\n${hints.join('\n')}` : ''
          return makeResult(true, sanitizedCommand, `${header}\n\n${text}${footer}`, { startedAt })
        }

        // Add other command cases here...
        case 'clear':
          // Frontend interprets CLEAR specially
          return makeResult(true, sanitizedCommand, 'CLEAR', { startedAt })

        case 'cat': {
          // Handle cat command for project details
          if (sanitizedArgs.length === 0) {
            return makeResult(false, sanitizedCommand, ansi.red('cat: missing file operand'), {
              startedAt,
              errorText: 'INVALID_ARGUMENTS',
            })
          }

          const projectName = sanitizedArgs[0]?.toLowerCase()
          if (!projectName) {
            return makeResult(false, sanitizedCommand, ansi.red('cat: missing file operand'), {
              startedAt,
              errorText: 'INVALID_ARGUMENTS',
            })
          }

          // Fetch the specific project
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

          const project = projects.find(p => p.name && p.name.toLowerCase() === projectName)

          if (!project) {
            return makeResult(
              false,
              sanitizedCommand,
              ansi.red(`cat: ${projectName}: No such file or directory`),
              { startedAt, errorText: 'NOT_FOUND' }
            )
          }

          // Display detailed project information
          const stack = (project.tech_stack ? JSON.parse(project.tech_stack) : []) as string[]
          const parts = [
            ansi.cyan(ansi.bold(`=== ${project.name} ===`)),
            '',
            project.description
              ? `${ansi.magenta('Description')}: ${project.description}`
              : undefined,
            `${ansi.magenta('Tech Stack')}: ${stack.length ? ansi.cyan(stack.join(', ')) : ansi.dim('None specified')}`,
            `${ansi.magenta('GitHub')}: ${project.github_url ? ansi.underline(ansi.cyan(project.github_url)) : ansi.dim('Not available')}`,
            `${ansi.magenta('Live URL')}: ${project.live_url ? ansi.underline(ansi.cyan(project.live_url)) : ansi.dim('Not available')}`,
            `${ansi.magenta('Status')}: ${ansi.cyan(project.status ?? 'Unknown')}`,
          ].filter(Boolean)

          return makeResult(true, sanitizedCommand, parts.join('\n'), { startedAt })
        }

        default: {
          // Use template processor for database-driven commands
          const processor = createTemplateProcessor(sanitizedArgs)
          const foundCommand = found as { responseTemplate?: string }

          // Process template or use fallback
          const template = foundCommand.responseTemplate
          const output = template
            ? processor.processTemplate(template)
            : ansi.green(`${sanitizedCommand} executed`)

          return makeResult(true, sanitizedCommand, output, { startedAt })
        }
      }
    } catch (error) {
      console.error('Terminal command execution error:', error)
      const message = error instanceof Error ? error.message : 'Invalid command or arguments'
      return makeResult(false, currentCommand, ansi.red(message))
    }
  })
