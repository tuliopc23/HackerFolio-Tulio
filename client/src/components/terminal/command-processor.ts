import {
  profileData,
  projectsData,
  aboutContent,
  contactContent,
  resumeContent,
} from '@/data/portfolio-data'

export interface CommandResult {
  output: string
  error?: boolean
  navigate?: string
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
    }
  }

  addToHistory(command: string) {
    if (command.trim() && this.history[this.history.length - 1] !== command) {
      this.history.push(command)
      localStorage.setItem('terminal-history', JSON.stringify(this.history))
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

    const [command, ...args] = trimmed.split(' ')
    const arg = args.join(' ')

    switch (command?.toLowerCase()) {
      case 'open':
        return this.open(arg)
      case 'theme':
        return this.theme(arg)
      case 'clear':
        return { output: 'CLEAR' }
      case 'ls':
        return this.ls()
      case 'cat':
        return this.cat(arg)
      case 'cams':
        return { output: 'ACCESS DENIED.', error: true }
      default:
        return {
          output: `Command not found: ${command ?? 'unknown'}\nType 'help' for available commands.`,
          error: true,
        }
    }
  }

  // kept for reference; currently unused
  /* @__PURE__ */
  // @ts-expect-error kept for reference
  private _help(): CommandResult {
    return {
      output: `Available Commands:

help                 - Show this help message
whoami              - Display user information  
grep stack          - Show technology stack
projects [filter]   - List projects with optional filter
printd contact      - Display contact information
open <route|url>    - Navigate to route or external URL
theme <name>        - Switch theme (lumon|neon|mono)
clear               - Clear terminal output
ls                  - List available content
cat <file>          - Display file content
time                - Show current time

Navigation:
/projects           - Portfolio projects
/about              - About me  
/contact            - Contact information
/resume             - Resume/CV

Keyboard Shortcuts:
Tab                 - Autocomplete command
↑↓                  - Command history
Ctrl+C              - Clear current input`,
    }
  }

  // kept for reference; currently unused
  /* @__PURE__ */

  // @ts-ignore - kept for reference, currently unused

  private _whoami(): CommandResult {
    return {
      output: `Name: ${profileData.name}
Role: ${profileData.title}
Location: ${profileData.location}
Status: ${profileData.status}`,
    }
  }

  private open(target: string): CommandResult {
    if (!target) {
      return { output: 'Usage: open <route|url>', error: true }
    }

    // Check if it's an internal route
    const internalRoutes = ['/projects', '/about', '/contact', '/resume']
    if (internalRoutes.includes(target)) {
      return { output: `Navigating to ${target}...`, navigate: target }
    }

    // Check if it's a URL
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.open(target, '_blank')
      return { output: `Opening ${target} in new tab...` }
    }

    // Check if it's a project link
    const project = projectsData.find(p => p.name.toLowerCase().includes(target.toLowerCase()))
    if (project?.links) {
      const links = Object.values(project.links)
      const firstLink = links[0]
      if (firstLink) {
        window.open(firstLink, '_blank')
        return { output: `Opening ${project.name}...` }
      }
    }

    return { output: `Cannot open '${target}' - not found`, error: true }
  }

  private theme(themeName: string): CommandResult {
    const validThemes = ['lumon', 'neon', 'mono']
    if (!validThemes.includes(themeName)) {
      return {
        output: `Invalid theme '${themeName}'\nAvailable themes: ${validThemes.join(', ')}`,
        error: true,
      }
    }

    // Theme switching will be handled by the component
    return { output: `Switching to ${themeName} theme...`, navigate: `theme:${themeName}` }
  }

  private ls(): CommandResult {
    return {
      output: `about.md
contact.md  
resume.md
projects/
  terminal-portfolio/
  ecommerce-platform/
  rust-cli-tool/
  mobile-trading-app/`,
    }
  }

  private cat(filename: string): CommandResult {
    switch (filename) {
      case 'about.md':
        return { output: aboutContent }
      case 'contact.md':
        return { output: contactContent }
      case 'resume.md':
        return { output: resumeContent }
      default:
        return { output: `cat: ${filename}: No such file or directory`, error: true }
    }
  }

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
      'grep stack',
      'contact',
      'about',
      'github',
      'resume',
    ]
    const merged = Array.from(new Set([...commands, ...Array.from(this.serverCommands)]))

    const routes = ['/projects', '/about', '/contact', '/resume']
    const themes = ['lumon', 'neon', 'mono']

    if (input.startsWith('open ')) {
      const partial = input.substring(5)
      return routes.filter(route => route.startsWith(partial)).map(route => `open ${route}`)
    }

    if (input.startsWith('theme ')) {
      const partial = input.substring(6)
      return themes.filter(theme => theme.startsWith(partial)).map(theme => `theme ${theme}`)
    }

    if (input.startsWith('cat ')) {
      const files = ['about.md', 'contact.md', 'resume.md']
      const partial = input.substring(4)
      return files.filter(file => file.startsWith(partial)).map(file => `cat ${file}`)
    }

    if (input.startsWith('projects ')) {
      const opts = ['--limit ', '--per ', '--page ', '--status ', '--stack ']
      const partial = input.substring('projects '.length)
      return opts.filter(o => o.startsWith(partial)).map(o => `projects ${o}`)
    }

    if (input.startsWith('help ')) {
      const partial = input.substring('help '.length).toLowerCase()
      const names = Array.from(new Set([...Array.from(this.serverCommands), ...commands]))
      return names
        .filter(n => n && !n.includes(' ') && n.toLowerCase().startsWith(partial))
        .map(n => `help ${n}`)
    }

    return merged.filter(cmd => cmd.startsWith(input))
  }
  setServerCommands = (cmds: string[]) => {
    for (const c of cmds) this.serverCommands.add(c)
  }
}
