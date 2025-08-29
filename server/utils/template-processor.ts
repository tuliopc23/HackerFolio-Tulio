import { ansi } from './terminal'

interface TemplateContext {
  args: string[]
  ansi: typeof ansi
  user: string
  currentTime: string
  timezone: string
  unixTime: number
  [key: string]: unknown
}

interface CommandHandlers {
  handleCatFile: (filename?: string) => string
  handleOpenCommand: (target?: string) => string
  handleThemeCommand: (theme?: string) => string
  [key: string]: (arg?: string) => string
}

/**
 * Advanced template processor for terminal command responses
 * Supports variables, function calls, and conditional logic
 */
export class TemplateProcessor {
  private context: TemplateContext
  private handlers: CommandHandlers

  constructor(args: string[] = []) {
    this.context = this.createContext(args)
    this.handlers = this.createHandlers()
  }

  private createContext(args: string[]): TemplateContext {
    const now = new Date()
    return {
      args,
      ansi,
      user: 'tulio',
      currentTime: now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      unixTime: Math.floor(now.getTime() / 1000),
    }
  }

  private createHandlers(): CommandHandlers {
    return {
      handleCatFile: (filename?: string) => {
        if (!filename) {
          return ansi.red(
            'Usage: cat <project-name>\nAvailable projects: liquidify, hackerfolio, switchify, cockpit, a-hackers-brand, coming-soon, swifget-cli'
          )
        }

        // Project tech stacks mapping
        const projects: Record<string, string> = {
          liquidify: `${ansi.cyan('LiqUIdify - Tech Stack')}

${ansi.magenta('Frontend')}:
• React - Component-based UI library
• TypeScript - Type-safe development
• Vite - Fast build tool and dev server
• Tailwind CSS - Utility-first CSS framework

${ansi.magenta('Runtime & Package Manager')}:
• Bun - Fast JavaScript runtime and package manager

${ansi.magenta('Design System')}:
• Apple Design Language inspired components
• Production-ready component library
• Consistent design tokens and theming`,

          hackerfolio: `${ansi.cyan('HackerFolio - Tech Stack')}

${ansi.magenta('Frontend')}:
• React - UI component library
• TypeScript - Type safety
• Vite - Build tool

${ansi.magenta('Backend')}:
• Elysia - Fast web framework for Bun
• Drizzle - Type-safe SQL ORM
• SQLite - Lightweight database

${ansi.magenta('Runtime')}:
• Bun - JavaScript runtime and package manager

${ansi.magenta('Theme')}:
• Terminal-inspired design
• Hacker aesthetic portfolio`,

          switchify: `${ansi.cyan('Switchify - Tech Stack')}

${ansi.magenta('Platform')}:
• SwiftUI - Native macOS UI framework
• Swift - Apple's programming language
• macOS - Native desktop application

${ansi.magenta('Features')}:
• Blazingly fast app switching
• Native macOS integration
• Optimized performance`,

          cockpit: `${ansi.cyan('Cockpit - Tech Stack')}

${ansi.magenta('Platform')}:
• SwiftUI - Cross-platform UI framework
• Swift - Native development language
• macOS & iPadOS - Multi-platform support

${ansi.magenta('Features')}:
• Cmd+K style interface
• Productivity powerhouse
• Cross-device synchronization`,

          'a-hackers-brand': `${ansi.cyan('A-Hackers-Brand - Tech Stack')}

${ansi.magenta('Frontend')}:
• SvelteKit - Full-stack web framework
• Svelte - Reactive UI framework
• Tailwind CSS - Utility-first styling

${ansi.magenta('Runtime')}:
• Bun - Fast JavaScript runtime

${ansi.magenta('Design System')}:
• Hacker/terminal aesthetics
• Web-focused design tokens
• Component library`,

          'coming-soon': `${ansi.cyan('Coming Soon - Tech Stack')}

${ansi.magenta('Platform')}:
• macOS - Native desktop application
• Terminal Innovation - New concepts

${ansi.magenta('Focus')}:
• macOS-centric design
• Revolutionary terminal experience
• Native system integration`,

          'swifget-cli': `${ansi.cyan('Swifget-CLI - Tech Stack')}

${ansi.magenta('Language')}:
• Swift - Apple's system programming language
• Native Swift CLI libraries

${ansi.magenta('Platform')}:
• macOS - Command-line interface
• Unix/POSIX - Standard CLI patterns

${ansi.magenta('Features')}:
• HTTP client functionality
• Download manager capabilities
• Beautiful macOS integration
• Command-line interface`,
        }

        // Legacy file support (keeping for backward compatibility)
        const files: Record<string, string> = {
          'about.md': `${ansi.cyan('About Tulio Pinheiro Cunha')}

I'm a passionate Full-Stack Developer from Rio de Janeiro, Brazil, with a love for creating efficient, scalable web applications. I specialize in modern JavaScript/TypeScript ecosystems and have a strong focus on user experience and clean code.

${ansi.magenta('Background')}:
• 5+ years of professional web development
• Computer Science background  
• Open source contributor
• Always learning new technologies

${ansi.magenta('Interests')}:
• Web Performance Optimization
• Developer Experience (DX)
• Clean Architecture
• Terminal Applications`,

          'contact.md': `${ansi.cyan('Contact Information')}

${ansi.magenta('Email')}: tulio@example.com
${ansi.magenta('GitHub')}: https://github.com/tuliopinheirocunha
${ansi.magenta('LinkedIn')}: https://linkedin.com/in/tuliopinheirocunha
${ansi.magenta('Location')}: Rio de Janeiro, Brazil

${ansi.green("Let's connect!")} I'm always open to discussing new opportunities, collaborations, or just chatting about technology.`,

          'resume.md': `${ansi.cyan('Tulio Pinheiro Cunha - Resume')}

${ansi.magenta('Experience')}:
• Senior Full-Stack Developer (2022-Present)
• Frontend Developer (2020-2022)  
• Junior Developer (2019-2020)

${ansi.magenta('Education')}:
• Computer Science Degree
• Multiple certifications in web technologies

${ansi.magenta('Key Skills')}:
• React, TypeScript, Node.js
• Database design and optimization
• Cloud deployment and DevOps
• Team leadership and mentoring

${ansi.green('Download full resume')}: https://tuliopinheirocunha.dev/resume.pdf`,
        }

        return (
          projects[filename] ??
          files[filename] ??
          ansi.red(`cat: ${filename}: No such project or file`)
        )
      },

      handleOpenCommand: (target?: string) => {
        if (!target) {
          return ansi.red('Usage: open <route|url>')
        }

        // Internal routes
        const internalRoutes = ['/projects', '/about', '/contact', '/resume', '/']
        if (internalRoutes.includes(target)) {
          return ansi.green(`Navigating to ${target}...`)
        }

        // External URLs
        if (target.startsWith('http://') || target.startsWith('https://')) {
          return ansi.green(`Opening ${target} in new tab...`)
        }

        return ansi.red(`Cannot open '${target}' - not found`)
      },

      handleThemeCommand: (theme?: string) => {
        if (!theme) {
          return ansi.red('Usage: theme <name>\nAvailable themes: oxocarbon')
        }

        const validThemes = ['oxocarbon']
        if (!validThemes.includes(theme)) {
          return ansi.red(`Invalid theme '${theme}'\nAvailable themes: ${validThemes.join(', ')}`)
        }

        return ansi.green(`Switching to ${theme} theme...`)
      },
    }
  }

  /**
   * Process a template string with variable substitution and function calls
   */
  processTemplate(template: string): string {
    if (!template) return ''

    let result = template

    // Replace simple variables: {{variableName}}
    result = result.replace(/{{(\w+)}}/g, (match, varName: string) => {
      if (varName in this.context) {
        const value = this.context[varName]
        return typeof value === 'string' || typeof value === 'number' ? String(value) : match
      }
      return match
    })

    // Replace ANSI function calls: {{ansi.color("text")}}
    result = result.replace(
      /{{ansi\.(\w+)\("([^"]+)"\)}}/g,
      (match, colorName: string, text: string) => {
        if (
          colorName in ansi &&
          typeof (ansi as Record<string, unknown>)[colorName] === 'function'
        ) {
          const colorFn = (ansi as Record<string, (text: string) => string>)[colorName]
          if (colorFn) {
            return colorFn(text)
          }
        }
        return match
      }
    )

    // Replace handler function calls: {{handlerName(args[0])}}
    result = result.replace(
      /{{(\w+)\(([^)]+)\)}}/g,
      (match, handlerName: string, argsStr: string) => {
        if (handlerName in this.handlers) {
          const handler = this.handlers[handlerName]
          if (typeof handler === 'function') {
            // Parse arguments - handle args[0], args[1], etc.
            if (argsStr.startsWith('args[') && argsStr.endsWith(']')) {
              const index = parseInt(argsStr.slice(5, -1))
              const arg = this.context.args[index]
              return arg ? handler(arg) : handler()
            }
          }
        }
        return match
      }
    )

    return result
  }

  /**
   * Add custom context variables
   */
  addContext(key: string, value: unknown): void {
    this.context[key] = value
  }

  /**
   * Get current context for debugging
   */
  getContext(): TemplateContext {
    return { ...this.context }
  }
}

/**
 * Factory function to create template processor
 */
export function createTemplateProcessor(args: string[] = []): TemplateProcessor {
  return new TemplateProcessor(args)
}
