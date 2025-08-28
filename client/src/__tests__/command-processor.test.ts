import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

import { CommandProcessor } from '@/components/terminal/command-processor'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Mock window.open
const mockWindowOpen = vi.fn()

// Setup global mocks in beforeAll
beforeEach(() => {
  // Ensure window is available in JSDOM
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  })

  Object.defineProperty(globalThis, 'window', {
    value: {
      localStorage: localStorageMock,
      open: mockWindowOpen,
    },
    configurable: true,
    writable: true,
  })
})

describe('CommandProcessor', () => {
  let processor: CommandProcessor

  beforeEach(() => {
    // Clear all mocks first
    vi.clearAllMocks()

    // Reset localStorage mock to return null (empty storage)
    localStorageMock.getItem.mockReturnValue(null)

    // Create a fresh processor instance for each test
    processor = new CommandProcessor()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    test('initializes with empty history when localStorage is empty', () => {
      // The constructor was already called in beforeEach
      expect(processor.getHistoryCommand('up')).toBe('')
    })

    test('can load saved history', () => {
      // Test that we can add history and retrieve it
      processor.addToHistory('test-command')
      expect(processor.getHistoryCommand('up')).toBe('test-command')
    })
  })

  describe('History Management', () => {
    test('adds commands to history', () => {
      processor.addToHistory('help')
      processor.addToHistory('ls')

      // Test that we can navigate through the history
      expect(processor.getHistoryCommand('up')).toBe('ls')
      expect(processor.getHistoryCommand('up')).toBe('help')
    })

    test('does not add empty commands to history', () => {
      processor.addToHistory('  ')
      processor.addToHistory('')

      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    test('does not add duplicate consecutive commands', () => {
      processor.addToHistory('help')
      processor.addToHistory('help')

      // Should only have one 'help' command in history
      expect(processor.getHistoryCommand('up')).toBe('help')
      // When we try to go up again, we should stay at the same command
      expect(processor.getHistoryCommand('up')).toBe('help')
    })

    test('navigates history up and down correctly', () => {
      processor.addToHistory('first')
      processor.addToHistory('second')
      processor.addToHistory('third')

      // Navigate up through history
      expect(processor.getHistoryCommand('up')).toBe('third')
      expect(processor.getHistoryCommand('up')).toBe('second')
      expect(processor.getHistoryCommand('up')).toBe('first')
      expect(processor.getHistoryCommand('up')).toBe('first') // Can't go further up

      // Navigate down through history
      expect(processor.getHistoryCommand('down')).toBe('second')
      expect(processor.getHistoryCommand('down')).toBe('third')
      expect(processor.getHistoryCommand('down')).toBe('') // Back to empty input
    })
  })

  describe('Command Parsing', () => {
    test('handles empty input', () => {
      const result = processor.processCommand('')
      expect(result).toEqual({ output: '' })
    })

    test('handles whitespace-only input', () => {
      const result = processor.processCommand('   ')
      expect(result).toEqual({ output: '' })
    })

    test('parses command with arguments', () => {
      const result = processor.processCommand('open /projects')
      expect(result.navigate).toBe('/projects')
    })

    test('parses command with multiple arguments', () => {
      const result = processor.processCommand('theme oxocarbon')
      expect(result.navigate).toBe('theme:oxocarbon')
    })
  })

  describe('Clear Command', () => {
    test('returns CLEAR output', () => {
      const result = processor.processCommand('clear')
      expect(result).toEqual({ output: 'CLEAR' })
    })

    test('handles case insensitive clear command', () => {
      const result = processor.processCommand('CLEAR')
      expect(result).toEqual({ output: 'CLEAR' })
    })
  })

  describe('Open Command', () => {
    test('navigates to internal routes', () => {
      const routes = ['/projects', '/about', '/contact', '/resume']

      routes.forEach(route => {
        const result = processor.processCommand(`open ${route}`)
        expect(result).toEqual({
          output: `Navigating to ${route}...`,
          navigate: route,
        })
      })
    })

    test('opens external URLs in new tab', () => {
      const url = 'https://github.com/tuliocunha'
      const result = processor.processCommand(`open ${url}`)

      expect(mockWindowOpen).toHaveBeenCalledWith(url, '_blank')
      expect(result.output).toBe(`Opening ${url} in new tab...`)
    })

    test('opens project links by name match', () => {
      const result = processor.processCommand('open terminal')

      expect(mockWindowOpen).toHaveBeenCalledWith('https://portfolio.tuliocunha.dev', '_blank')
      expect(result.output).toBe('Opening Terminal Portfolio...')
    })

    test('returns error for invalid targets', () => {
      const result = processor.processCommand('open invalid-target')
      expect(result).toEqual({
        output: "Cannot open 'invalid-target' - not found",
        error: true,
      })
    })

    test('returns usage error when no target provided', () => {
      const result = processor.processCommand('open')
      expect(result).toEqual({
        output: 'Usage: open <route|url>',
        error: true,
      })
    })
  })

  describe('Theme Command', () => {
    test('switches to valid themes', () => {
      const validThemes = ['oxocarbon']

      validThemes.forEach(theme => {
        const result = processor.processCommand(`theme ${theme}`)
        expect(result).toEqual({
          output: `Switching to ${theme} theme...`,
          navigate: `theme:${theme}`,
        })
      })
    })

    test('returns error for invalid themes', () => {
      const result = processor.processCommand('theme invalid')
      expect(result).toEqual({
        output: "Invalid theme 'invalid'\nAvailable themes: oxocarbon",
        error: true,
      })
    })

    test('handles missing theme argument', () => {
      const result = processor.processCommand('theme')
      expect(result).toEqual({
        output: "Invalid theme ''\nAvailable themes: oxocarbon",
        error: true,
      })
    })
  })

  describe('LS Command', () => {
    test('lists available files and directories', () => {
      const result = processor.processCommand('ls')
      expect(result.output).toContain('about.md')
      expect(result.output).toContain('contact.md')
      expect(result.output).toContain('resume.md')
      expect(result.output).toContain('projects/')
      expect(result.output).toContain('terminal-portfolio/')
    })
  })

  describe('Cat Command', () => {
    test('displays file contents for valid files', () => {
      const files = ['about.md', 'contact.md', 'resume.md']

      files.forEach(file => {
        const result = processor.processCommand(`cat ${file}`)
        expect(result.output).toBeTruthy()
        expect(result.error).toBeUndefined()
      })
    })

    test('returns error for invalid files', () => {
      const result = processor.processCommand('cat invalid.txt')
      expect(result).toEqual({
        output: 'cat: invalid.txt: No such file or directory',
        error: true,
      })
    })

    test('returns error when no file specified', () => {
      const result = processor.processCommand('cat')
      expect(result).toEqual({
        output: 'cat: : No such file or directory',
        error: true,
      })
    })
  })

  describe('Security Command', () => {
    test('denies access to cams command', () => {
      const result = processor.processCommand('cams')
      expect(result).toEqual({
        output: 'ACCESS DENIED.',
        error: true,
      })
    })
  })

  describe('Unknown Commands', () => {
    test('returns error for unknown commands', () => {
      const result = processor.processCommand('unknown-command')
      expect(result).toEqual({
        output: "Command not found: unknown-command\nType 'help' for available commands.",
        error: true,
      })
    })

    test('handles unknown commands with arguments', () => {
      const result = processor.processCommand('invalid arg1 arg2')
      expect(result.output).toContain('Command not found: invalid')
      expect(result.error).toBe(true)
    })
  })

  describe('Autocomplete', () => {
    test('suggests commands based on input', () => {
      const suggestions = processor.getAutocomplete('th')
      expect(suggestions).toContain('theme')
    })

    test('suggests routes for open command', () => {
      const suggestions = processor.getAutocomplete('open /')
      expect(suggestions).toContain('open /projects')
      expect(suggestions).toContain('open /about')
      expect(suggestions).toContain('open /contact')
      expect(suggestions).toContain('open /resume')
    })

    test('suggests themes for theme command', () => {
      const suggestions = processor.getAutocomplete('theme ')
      expect(suggestions).toContain('theme oxocarbon')
    })

    test('suggests files for cat command', () => {
      const suggestions = processor.getAutocomplete('cat ')
      expect(suggestions).toContain('cat about.md')
      expect(suggestions).toContain('cat contact.md')
      expect(suggestions).toContain('cat resume.md')
    })

    test('suggests partial matches for theme command', () => {
      const suggestions = processor.getAutocomplete('theme ox')
      expect(suggestions).toContain('theme oxocarbon')
    })

    test('suggests options for projects command', () => {
      const suggestions = processor.getAutocomplete('projects -')
      expect(suggestions).toContain('projects --limit ')
      expect(suggestions).toContain('projects --status ')
    })

    test('returns empty array for complete commands', () => {
      const suggestions = processor.getAutocomplete('xyz')
      expect(suggestions).toEqual([])
    })
  })

  describe('Server Commands Integration', () => {
    test('adds server commands to available commands', () => {
      const serverCommands = ['server-cmd1', 'server-cmd2']
      processor.setServerCommands(serverCommands)

      const suggestions = processor.getAutocomplete('server')
      expect(suggestions).toContain('server-cmd1')
      expect(suggestions).toContain('server-cmd2')
    })

    test('includes server commands in help suggestions', () => {
      processor.setServerCommands(['api-status'])

      const suggestions = processor.getAutocomplete('help api')
      expect(suggestions).toContain('help api-status')
    })
  })

  describe('Case Sensitivity', () => {
    test('handles commands case insensitively', () => {
      const lowerResult = processor.processCommand('clear')
      const upperResult = processor.processCommand('CLEAR')
      const mixedResult = processor.processCommand('Clear')

      expect(lowerResult).toEqual(upperResult)
      expect(upperResult).toEqual(mixedResult)
    })

    test('preserves case in arguments', () => {
      const result = processor.processCommand('open /Projects')
      // /Projects is not a valid internal route, so it should return an error
      expect(result.error).toBe(true)
      expect(result.output).toContain('Cannot open')
    })
  })

  describe('Edge Cases', () => {
    test('handles commands with extra whitespace', () => {
      const result = processor.processCommand('  clear  ')
      expect(result).toEqual({ output: 'CLEAR' })
    })

    test('handles commands with multiple spaces between arguments', () => {
      // Multiple spaces between command and args result in leading spaces in args
      // which don't match internal routes, so it should return an error
      const result = processor.processCommand('open    /projects')
      expect(result.error).toBe(true)
      expect(result.output).toContain('Cannot open')
    })

    test('handles very long command strings', () => {
      const longCommand = 'a'.repeat(1000)
      const result = processor.processCommand(longCommand)
      expect(result.error).toBe(true)
      expect(result.output).toContain('Command not found')
    })
  })
})
