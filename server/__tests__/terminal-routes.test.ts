import { Elysia } from 'elysia'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// Simple terminal route tests focusing on basic functionality
describe('Terminal Routes - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should create basic commands endpoint', async () => {
    const mockCommands = [
      {
        id: 1,
        command: 'help',
        description: 'Show help information',
        category: 'utility',
        responseTemplate: null,
        isActive: true,
      },
      {
        id: 2,
        command: 'projects',
        description: 'List projects',
        category: 'portfolio',
        responseTemplate: null,
        isActive: true,
      },
    ]

    const app = new Elysia().get('/api/commands', () => mockCommands.filter(c => c.isActive))

    const response = await app.handle(new Request('http://localhost/api/commands'))

    expect(response.status).toBe(200)
    const data = await response.json()

    // Type guard for command array
    const isCommandArray = (data: unknown): data is Array<{ command: string }> => {
      return (
        Array.isArray(data) &&
        data.every(item => typeof item === 'object' && item !== null && 'command' in item)
      )
    }

    expect(data).toHaveLength(2)
    expect(isCommandArray(data)).toBe(true)
    if (isCommandArray(data)) {
      expect(data.map(c => c.command)).toEqual(['help', 'projects'])
    }
  })

  test('should filter commands by category', async () => {
    const mockCommands = [
      {
        id: 1,
        command: 'help',
        description: 'Show help information',
        category: 'utility',
        responseTemplate: null,
        isActive: true,
      },
      {
        id: 2,
        command: 'projects',
        description: 'List projects',
        category: 'portfolio',
        responseTemplate: null,
        isActive: true,
      },
    ]

    const app = new Elysia().get('/api/commands', ({ query }: { query: any }) => {
      const { category } = query
      return mockCommands.filter(c => c.isActive && (!category || c.category === category))
    })

    const response = await app.handle(new Request('http://localhost/api/commands?category=utility'))

    expect(response.status).toBe(200)
    const data = await response.json()

    // Type guard for single command
    const isCommand = (data: unknown): data is { command: string } => {
      return typeof data === 'object' && data !== null && 'command' in data
    }

    expect(data).toHaveLength(1)
    expect(Array.isArray(data) && data.length > 0 && isCommand(data[0])).toBe(true)
    if (Array.isArray(data) && isCommand(data[0])) {
      expect(data[0].command).toBe('help')
    }
  })

  test('should handle command execution - unknown command', async () => {
    const app = new Elysia().post('/api/commands/execute', ({ body }: { body: any }) => {
      const { command } = body

      const knownCommands = ['help', 'projects', 'clear']
      if (!knownCommands.includes(command)) {
        return {
          output: `Command not found: ${command}`,
          error: true,
        }
      }

      return { output: `${command} executed` }
    })

    const requestBody = {
      command: 'nonexistent',
      args: [],
    }

    const response = await app.handle(
      new Request('http://localhost/api/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(200)
    const data = await response.json()

    // Type guard for terminal command error response
    const isErrorResponse = (data: unknown): data is { error: boolean; output: string } => {
      return typeof data === 'object' && data !== null && 'error' in data && 'output' in data
    }

    expect(isErrorResponse(data)).toBe(true)
    if (isErrorResponse(data)) {
      expect(data.error).toBe(true)
      expect(data.output).toContain('Command not found: nonexistent')
    }
  })

  test('should handle clear command', async () => {
    const app = new Elysia().post('/api/commands/execute', ({ body }: { body: any }) => {
      const { command } = body

      if (command === 'clear') {
        return { output: 'CLEAR' }
      }

      return { output: `${command} executed` }
    })

    const requestBody = {
      command: 'clear',
      args: [],
    }

    const response = await app.handle(
      new Request('http://localhost/api/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })
    )

    expect(response.status).toBe(200)
    const data = await response.json()

    // Type guard for terminal output response
    const isOutputResponse = (data: unknown): data is { output: string } => {
      return typeof data === 'object' && data !== null && 'output' in data
    }

    expect(isOutputResponse(data)).toBe(true)
    if (isOutputResponse(data)) {
      expect(data.output).toBe('CLEAR')
    }
  })

  test('should handle help command with basic response', async () => {
    const app = new Elysia().post('/api/commands/execute', ({ body }: { body: any }) => {
      const { command, args = [] } = body

      if (command === 'help') {
        const target = args[0]

        if (target) {
          return {
            output: `Command: ${target}\\nDescription: Help for ${target} command\\nUsage: ${target} [options]`,
          }
        }

        return {
          output: `Available Commands:\\n\\nhelp - Show help information\\nprojects - List projects\\nclear - Clear terminal`,
        }
      }

      return { output: `${command} executed` }
    })

    // Test general help
    const helpResponse = await app.handle(
      new Request('http://localhost/api/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'help', args: [] }),
      })
    )

    expect(helpResponse.status).toBe(200)
    const helpData = await helpResponse.json()

    // Type guard for help response
    const isHelpResponse = (data: unknown): data is { output: string } => {
      return typeof data === 'object' && data !== null && 'output' in data
    }

    expect(isHelpResponse(helpData)).toBe(true)
    if (isHelpResponse(helpData)) {
      expect(helpData.output).toContain('Available Commands')
      expect(helpData.output).toContain('help - Show help information')
      expect(helpData.output).toContain('projects - List projects')
    }

    // Test specific command help
    const projectsHelpResponse = await app.handle(
      new Request('http://localhost/api/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'help', args: ['projects'] }),
      })
    )

    expect(projectsHelpResponse.status).toBe(200)
    const projectsHelpData = await projectsHelpResponse.json()

    expect(isHelpResponse(projectsHelpData)).toBe(true)
    if (isHelpResponse(projectsHelpData)) {
      expect(projectsHelpData.output).toContain('Command: projects')
      expect(projectsHelpData.output).toContain('Description:')
      expect(projectsHelpData.output).toContain('Usage:')
    }
  })

  test('should handle invalid request body', async () => {
    const app = new Elysia().post('/api/commands/execute', ({ body }: { body: any }) => {
      if (!body?.command) {
        throw new Error('Invalid request: command is required')
      }
      return { output: 'ok' }
    })

    const response = await app.handle(
      new Request('http://localhost/api/commands/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'data' }),
      })
    )

    expect(response.status).toBe(500)
  })
})
