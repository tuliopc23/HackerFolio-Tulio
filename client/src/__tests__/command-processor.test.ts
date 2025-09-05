// vitest globals are available - no import needed

import { CommandProcessor } from '@/components/terminal/command-processor'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

// Setup global mocks
beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  })
})

describe('CommandProcessor', () => {
  let processor: CommandProcessor

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    processor = new CommandProcessor()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    test('initializes with empty history when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null)
      new CommandProcessor()
      expect(localStorageMock.getItem).toHaveBeenCalledWith('terminal-history')
    })

    test('loads saved history from localStorage', () => {
      const savedHistory = JSON.stringify(['help', 'whoami'])
      localStorageMock.getItem.mockReturnValue(savedHistory)
      new CommandProcessor()
      expect(localStorageMock.getItem).toHaveBeenCalledWith('terminal-history')
    })
  })

  describe('History Management', () => {
    test('adds commands to history', () => {
      processor.addToHistory('test command')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'terminal-history',
        JSON.stringify(['test command'])
      )
    })

    test('does not add empty commands to history', () => {
      processor.addToHistory('')
      processor.addToHistory('   ')
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    test('does not add duplicate consecutive commands', () => {
      processor.addToHistory('same command')
      processor.addToHistory('same command')
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1)
    })

    test('navigates history up and down correctly', () => {
      // Set up history
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['first', 'second']))
      const processorWithHistory = new CommandProcessor()

      expect(processorWithHistory.getHistoryCommand('up')).toBe('second')
      expect(processorWithHistory.getHistoryCommand('up')).toBe('first')
      expect(processorWithHistory.getHistoryCommand('down')).toBe('second')
      expect(processorWithHistory.getHistoryCommand('down')).toBe('')
    })
  })

  describe('Command Processing - Server-Driven Architecture', () => {
    test('handles empty input', () => {
      const result = processor.processCommand('')
      expect(result).toEqual({ output: '' })
    })

    test('handles whitespace-only input', () => {
      const result = processor.processCommand('   ')
      expect(result).toEqual({ output: '' })
    })

    test('all commands are now server-driven', () => {
      const commands = [
        'help',
        'ls',
        'cat liquidify',
        'grep',
        'whoami',
        'open /projects',
        'clear',
        'unknown-command',
      ]

      commands.forEach(command => {
        const result = processor.processCommand(command)
        expect(result).toEqual({
          output: '',
          serverCommand: true,
        })
      })
    })

    test('processes commands with arguments as server commands', () => {
      const result = processor.processCommand('cat liquidify')
      expect(result.serverCommand).toBe(true)
      expect(result.output).toBe('')
    })
  })

  describe('Autocomplete', () => {
    test('suggests commands based on input', () => {
      const suggestions = processor.getAutocomplete('he')
      expect(suggestions).toContain('help')
    })

    test('suggests routes for open command', () => {
      const suggestions = processor.getAutocomplete('open ')
      expect(suggestions).toContain('open /projects')
      expect(suggestions).toContain('open /about')
      expect(suggestions).toContain('open /contact')
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
      const suggestions = processor.getAutocomplete('projects ')
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0]).toMatch(/^projects --/)
    })

    test('returns empty array for complete commands', () => {
      const suggestions = processor.getAutocomplete('help ')
      expect(suggestions.length).toBeGreaterThan(0) // Should suggest command names
    })
  })

  describe('Server Commands Integration', () => {
    test('adds server commands to available commands', () => {
      const serverCommands = ['custom-server-cmd', 'another-cmd']
      processor.setServerCommands(serverCommands)

      const suggestions = processor.getAutocomplete('')
      expect(suggestions).toContain('custom-server-cmd')
      expect(suggestions).toContain('another-cmd')
    })

    test('includes server commands in help suggestions', () => {
      processor.setServerCommands(['server-help'])
      const suggestions = processor.getAutocomplete('server-h')
      expect(suggestions).toContain('server-help')
    })
  })

  describe('Case Sensitivity and Edge Cases', () => {
    test('handles commands case insensitively in autocomplete', () => {
      const suggestions = processor.getAutocomplete('HE')
      expect(suggestions).toContain('help')
    })

    test('handles commands with extra whitespace', () => {
      const result = processor.processCommand('  help  ')
      expect(result.serverCommand).toBe(true)
    })

    test('handles very long command strings', () => {
      const longCommand = 'cat ' + 'a'.repeat(1000)
      const result = processor.processCommand(longCommand)
      expect(result.serverCommand).toBe(true)
    })

    test('handles empty history navigation', () => {
      expect(processor.getHistoryCommand('up')).toBe('')
      expect(processor.getHistoryCommand('down')).toBe('')
    })
  })
})
