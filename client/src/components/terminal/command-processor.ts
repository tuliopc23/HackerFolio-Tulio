export interface CommandResult {
  output: string
  error?: boolean
  navigate?: string
  serverCommand?: boolean // Flag to indicate command should go to server
}

export class CommandProcessor {
  private history: string[] = []
  private historyIndex = -1
  private serverCommands = new Set<string>()

  constructor() {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('terminal-history')
    if (savedHistory) {
      this.history = JSON.parse(savedHistory) as string[]
      this.historyIndex = this.history.length
    }
  }

  addToHistory(command: string) {
    if (command.trim() && this.history[this.history.length - 1] !== command) {
      this.history.push(command)
      try {
        localStorage.setItem('terminal-history', JSON.stringify(this.history))
      } catch {
        // Ignore quota or availability errors silently
      }
      this.historyIndex = this.history.length
    }
  }

  getHistoryCommand(direction: 'up' | 'down'): string {
    if (this.history.length === 0) {
      return ''
    }

    if (direction === 'up') {
      if (this.historyIndex > 0) {
        this.historyIndex--
      } else if (this.historyIndex === this.history.length) {
        // Coming from "beyond" history, go to last command
        this.historyIndex = this.history.length - 1
      }
      // Stay at current position if already at 0
      return this.history[this.historyIndex] ?? ''
    } else {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        return this.history[this.historyIndex] ?? ''
      } else {
        // Go beyond history (empty input)
        this.historyIndex = this.history.length
        return ''
      }
    }
  }

  processCommand(input: string): CommandResult {
    const trimmed = input.trim()
    if (!trimmed) return { output: '' }

    // All commands now go to server - database-driven approach
    // Only handle history locally, everything else is server-side
    return {
      output: '',
      serverCommand: true, // Signal to send to server
    }
  }

  // All methods below are now handled server-side
  // Keeping for potential future client-side optimizations

  getAutocomplete(input: string): string[] {
    const commands = [
      'help',
      'whoami',
      'stack',
      'projects',
      'open',
      'theme',
      'clear',
      'ls',
      'cat',
      'time',
      'github',
    ]
    const merged = Array.from(new Set([...commands, ...Array.from(this.serverCommands)]))

    const routes = ['/projects']
    const themes = ['oxocarbon']

    if (input.startsWith('open ')) {
      const partial = input.substring(5).toLowerCase()
      return routes
        .filter(route => route.toLowerCase().startsWith(partial))
        .map(route => `open ${route}`)
    }

    if (input.startsWith('theme ')) {
      const partial = input.substring(6).toLowerCase()
      return themes
        .filter(theme => theme.toLowerCase().startsWith(partial))
        .map(theme => `theme ${theme}`)
    }

    if (input.startsWith('cat ')) {
      const files = [] as string[]
      const partial = input.substring(4).toLowerCase()
      return files.filter(file => file.toLowerCase().startsWith(partial)).map(file => `cat ${file}`)
    }

    if (input.startsWith('projects ')) {
      const opts = ['--limit ', '--per ', '--page ', '--status ', '--stack ']
      const partial = input.substring('projects '.length).toLowerCase()
      return opts.filter(o => o.toLowerCase().startsWith(partial)).map(o => `projects ${o}`)
    }

    if (input.startsWith('help ')) {
      const partial = input.substring('help '.length).toLowerCase()
      const names = Array.from(new Set([...Array.from(this.serverCommands), ...commands]))
      return names
        .filter(n => n && !n.includes(' ') && n.toLowerCase().startsWith(partial))
        .map(n => `help ${n}`)
    }

    return merged.filter(cmd => cmd.toLowerCase().startsWith(input.toLowerCase()))
  }
  setServerCommands = (cmds: string[]) => {
    for (const c of cmds) this.serverCommands.add(c)
  }
}
