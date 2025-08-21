import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, type KeyboardEvent } from 'react'

import {
  executeCommand as executeServerCommand,
  fetchCommands,
  type ServerCommandResult,
} from '@/lib/api'

import { CommandProcessor, type CommandResult } from './command-processor'
import { useTheme } from './theme-context'

interface TerminalHistory {
  command: string
  output: string
  timestamp: Date
  error?: boolean | undefined
}

export default function TerminalPane() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<TerminalHistory[]>([])
  const [processor] = useState(() => new CommandProcessor())
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-focus input
    if (inputRef.current) {
      inputRef.current.focus()
    }
    // Add ANSI-colored boot messages into history for consistent styling
    setHistory(prev => {
      if (prev.length > 0) return prev
      const boot = `\x1b[36mInitializing secure connection...\x1b[39m\n\x1b[32m✓ Connection established\x1b[39m`
      const art = `\x1b[36m████████╗██╗   ██╗██╗     ██╗ ██████╗ \n╚══██╔══╝██║   ██║██║     ██║██╔═══██╗\n   ██║   ██║   ██║██║     ██║██║   ██║\n   ██║   ██║   ██║██║     ██║██║   ██║\n   ██║   ╚██████╔╝███████╗██║╚██████╔╝\n   ╚═╝    ╚═════╝ ╚══════╝╚═╝ ╚═════╝\x1b[39m`
      const tip = `\x1b[35mTip\x1b[39m: Type \x1b[36mhelp\x1b[39m or \x1b[36mhelp projects\x1b[39m for flags`
      return [
        ...prev,
        { command: '', output: boot, timestamp: new Date() },
        { command: '', output: art, timestamp: new Date() },
        { command: '', output: tip, timestamp: new Date() },
      ]
    })
  }, [])

  useEffect(() => {
    // Fetch server commands for autocomplete enrichment
    void (async () => {
      try {
        const cmds = await fetchCommands()
        processor.setServerCommands?.(cmds.map(c => c.command))
      } catch {}
    })()
  }, [processor])

  useEffect(() => {
    // Scroll to bottom when history updates
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void runCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const historyCommand = processor.getHistoryCommand('up')
      setInput(historyCommand)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const historyCommand = processor.getHistoryCommand('down')
      setInput(historyCommand)
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleAutocomplete()
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault()
      setInput('')
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      setHistory([])
    }
  }

  const runCommand = async (command: string) => {
    if (!command.trim()) return

    processor.addToHistory(command)
    const result: CommandResult = processor.processCommand(command)

    // Handle special commands
    if (result.output === 'CLEAR') {
      setHistory([])
      setInput('')
      return
    }

    // Handle navigation
    if (result.navigate) {
      if (result.navigate.startsWith('theme:')) {
        const themeName = result.navigate.substring(6) as 'lumon' | 'neon' | 'mono'
        setTheme(themeName)
      } else {
        navigate({ to: result.navigate })
      }
    }

    let finalOutput = result.output
    let finalError = result.error
    let serverResult: ServerCommandResult | null = null

    // Prefer server for dynamic commands
    const [rootCmd, ...rest] = command.split(' ')
    const shouldAskServer = [
      'help',
      'projects',
      'about',
      'skills',
      'contact',
      'github',
      'resume',
      'clear',
      'whoami',
      'stack',
    ].includes(rootCmd ?? '')

    // Fallback to server for unknown commands or specific dynamic ones
    if (shouldAskServer || (result.error && result.output.startsWith('Command not found'))) {
      try {
        const cmd = rootCmd ?? ''
        const args = rest
        serverResult = await executeServerCommand(cmd, args)
        finalOutput = serverResult.output
        finalError = serverResult.error
      } catch (_err) {
        finalOutput = 'Server error executing command'
        finalError = true
      }
    }

    // Execute action from server if provided
    if (serverResult?.action?.type === 'open_url' && serverResult.action.url) {
      const { url } = serverResult.action
      if (url.startsWith('http') && typeof window !== 'undefined') {
        try {
          window.open(url, '_blank')
        } catch (error) {
          console.warn('Failed to open URL:', url, error)
        }
      }
    }

    // Add to history with final output
    setHistory(prev => [
      ...prev,
      {
        command,
        output: finalOutput,
        timestamp: new Date(),
        error: finalError,
      },
    ])

    setInput('')
  }

  const handleAutocomplete = () => {
    const suggestions = processor.getAutocomplete(input)
    if (suggestions.length === 1) {
      setInput(suggestions[0])
    } else if (suggestions.length > 1) {
      // Show suggestions in output
      setHistory(prev => [
        ...prev,
        {
          command: input,
          output: suggestions.join('  '),
          timestamp: new Date(),
        },
      ])
    }
  }

  const formatOutput = (output: string) => {
    // ANSI parser for SGR codes (very small subset)
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const ANSI_PATTERN = /\x1b\[([0-9;]+)m/g // e.g., \x1b[31m or \x1b[1;32m

    interface StyleState {
      bold?: boolean
      italic?: boolean
      underline?: boolean
      fg?: string | null
      bg?: string | null
    }
    const initState = (): StyleState => ({
      bold: false,
      italic: false,
      underline: false,
      fg: null,
      bg: null,
    })

    const stateToClass = (s: StyleState) => {
      const classes: string[] = []
      if (s.bold) classes.push('ansi-bold')
      if (s.italic) classes.push('ansi-italic')
      if (s.underline) classes.push('ansi-underline')
      if (s.fg) classes.push(`ansi-fg-${s.fg}`)
      if (s.bg) classes.push(`ansi-bg-${s.bg}`)
      return classes.join(' ')
    }

    const applyCode = (s: StyleState, code: number) => {
      if (code === 0) return initState() // reset
      if (code === 1) return { ...s, bold: true }
      if (code === 3) return { ...s, italic: true }
      if (code === 4) return { ...s, underline: true }
      if (code === 22) return { ...s, bold: false }
      if (code === 23) return { ...s, italic: false }
      if (code === 24) return { ...s, underline: false }
      if (code === 39) return { ...s, fg: null }
      if (code === 49) return { ...s, bg: null }
      const fgMap: Record<number, string> = {
        30: 'black',
        31: 'red',
        32: 'green',
        33: 'yellow',
        34: 'blue',
        35: 'magenta',
        36: 'cyan',
        37: 'white',
        90: 'bright-black',
        91: 'bright-red',
        92: 'bright-green',
        93: 'bright-yellow',
        94: 'bright-blue',
        95: 'bright-magenta',
        96: 'bright-cyan',
        97: 'bright-white',
      }
      const bgMap: Record<number, string> = {
        40: 'black',
        41: 'red',
        42: 'green',
        43: 'yellow',
        44: 'blue',
        45: 'magenta',
        46: 'cyan',
        47: 'white',
        100: 'bright-black',
        101: 'bright-red',
        102: 'bright-green',
        103: 'bright-yellow',
        104: 'bright-blue',
        105: 'bright-magenta',
        106: 'bright-cyan',
        107: 'bright-white',
      }
      if (fgMap[code]) return { ...s, fg: fgMap[code] }
      if (bgMap[code]) return { ...s, bg: bgMap[code] }
      return s
    }

    const renderTextWithLinks = (text: string) => {
      const parts: Array<string | { url: string }> = []
      let lastIndex = 0
      const matches = Array.from(text.matchAll(urlRegex))
      for (const match of matches) {
        const url = match[0]
        const index = match.index ?? 0
        if (index > lastIndex) parts.push(text.slice(lastIndex, index))
        parts.push({ url })
        lastIndex = index + url.length
      }
      if (lastIndex < text.length) parts.push(text.slice(lastIndex))
      if (parts.length === 0) parts.push(text)
      return parts.map((p, j) =>
        typeof p === 'string' ? (
          <span key={j}>{p}</span>
        ) : (
          <a
            key={j}
            href={p.url}
            target='_blank'
            rel='noopener noreferrer'
            className='underline text-cyan-bright'
          >
            {p.url}
          </a>
        )
      )
    }

    const renderLine = (line: string, i: number) => {
      const segments: Array<{ text: string; classes: string }> = []
      let lastIndex = 0
      let state = initState()
      let match: RegExpExecArray | null
      while ((match = ANSI_PATTERN.exec(line)) !== null) {
        const idx = match.index
        if (idx > lastIndex) {
          segments.push({ text: line.slice(lastIndex, idx), classes: stateToClass(state) })
        }
        const codes = match[1].split(';').map(n => Number(n || '0'))
        for (const code of codes) state = applyCode(state, code)
        lastIndex = ANSI_PATTERN.lastIndex
      }
      if (lastIndex < line.length) {
        segments.push({ text: line.slice(lastIndex), classes: stateToClass(state) })
      }

      return (
        <div key={i} className='whitespace-pre-wrap'>
          {segments.map((seg, k) => (
            <span key={k} className={seg.classes}>
              {renderTextWithLinks(seg.text)}
            </span>
          ))}
        </div>
      )
    }

    return output.split('\n').map((line, i) => renderLine(line, i))
  }

  return (
    <div className='pane-border pane-focus rounded-lg overflow-hidden flex flex-col h-full'>
      {/* Pane Header */}
      <div className='bg-lumon-border px-4 py-2 border-b border-cyan-soft flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-cyan-bright font-medium'>[pane-01]</span>
          <span className='text-text-soft'>terminal</span>
        </div>
        <div className='flex gap-2'>
          <div className='w-3 h-3 rounded-full bg-terminal-red' />
          <div className='w-3 h-3 rounded-full bg-terminal-orange' />
          <div className='w-3 h-3 rounded-full bg-terminal-green' />
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={outputRef}
        className='flex-1 p-4 bg-lumon-bg overflow-y-auto'
        id='terminal-content'
        role='log'
        aria-live='polite'
        aria-label='Terminal output'
      >
        {/* Command History */}
        <div className='terminal-output space-y-2'>
          {history.map((entry, index) => (
            <div key={index}>
              <div className='flex'>
                <span className='text-magenta-bright'>user@portfolio:~$</span>
                <span className='ml-2 text-text-cyan'>{entry.command}</span>
              </div>
              {entry.output && (
                <div
                  className={`ml-4 mb-2 ${entry.error ? 'text-terminal-red' : 'text-text-soft'}`}
                >
                  {formatOutput(entry.output)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Current Command Line */}
        <div className='flex items-center'>
          <span className='text-magenta-bright'>user@portfolio:~$</span>
          <input
            ref={inputRef}
            type='text'
            value={input}
            onChange={e => {
              setInput(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            className='ml-2 bg-transparent border-none outline-none text-text-cyan flex-1 focus:ring-2 focus:ring-magenta-bright focus:ring-opacity-30'
            aria-label='Terminal command input'
            aria-describedby='terminal-help'
            autoComplete='off'
            spellCheck='false'
            placeholder='Type a command...'
          />
          <span className='cursor-block' />
        </div>
      </div>

      {/* Command Help Footer */}
      <div className='bg-lumon-border px-4 py-2 border-t border-cyan-soft text-xs text-text-soft'>
        <div className='flex flex-wrap gap-4'>
          <span>
            <kbd className='bg-lumon-dark px-1 rounded'>Tab</kbd> autocomplete
          </span>
          <span>
            <kbd className='bg-lumon-dark px-1 rounded'>↑↓</kbd> history
          </span>
          <span>
            <kbd className='bg-lumon-dark px-1 rounded'>Ctrl+C</kbd> clear
          </span>
          <span>
            <kbd className='bg-lumon-dark px-1 rounded'>Ctrl+L</kbd> clear screen
          </span>
        </div>
      </div>
    </div>
  )
}
