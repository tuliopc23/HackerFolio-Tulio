import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, type KeyboardEvent } from 'react'

import { useFocusRegistration } from '@/components/accessibility/focus-manager'
import { useTerminalAccessibility } from '@/hooks/use-accessibility'
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
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastCommandStatus, setLastCommandStatus] = useState<'success' | 'error' | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Accessibility hooks
  const { announce, announceCommand, announceError } = useTerminalAccessibility()
  useFocusRegistration('terminal-input', inputRef as React.RefObject<HTMLElement>)
  useFocusRegistration('terminal-pane', terminalRef as React.RefObject<HTMLElement>)

  useEffect(() => {
    // Auto-focus input
    if (inputRef.current) {
      inputRef.current.focus()
      announce('Terminal initialized and ready for commands', 'polite')
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
  }, [announce])

  useEffect(() => {
    // Fetch server commands for autocomplete enrichment
    void (async () => {
      try {
        const cmds = await fetchCommands()
        processor.setServerCommands(cmds.map(c => c.command))
      } catch {
        /* intentional noop - server commands are optional */
      }
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
      if (isExecuting) {
        announce('Command is already executing, please wait', 'assertive')
        return
      }
      void runCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const historyCommand = processor.getHistoryCommand('up')
      const newInput = historyCommand || ''
      setInput(newInput)
      if (newInput) {
        announce(`Previous command: ${newInput}`, 'polite')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const historyCommand = processor.getHistoryCommand('down')
      const newInput = historyCommand || ''
      setInput(newInput)
      if (newInput) {
        announce(`Next command: ${newInput}`, 'polite')
      } else {
        announce('Cleared command input', 'polite')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleAutocomplete()
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault()
      setInput('')
      announce('Command input cleared', 'polite')
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault()
      setHistory([])
      announce('Terminal screen cleared', 'polite')
    }
  }

  const runCommand = async (command: string) => {
    if (!command.trim()) return

    setIsExecuting(true)
    announceCommand(command)
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
        const themeName = result.navigate.substring(6)
        if (themeName === 'oxocarbon') {
          setTheme(themeName)
        }
      } else {
        void navigate({ to: result.navigate })
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
        } catch (_error) {
          // Failed to open URL - silently ignore
        }
      }
    }

    // Add to history with final output
    const isError = finalError

    setHistory(prev => [
      ...prev,
      {
        command,
        output: finalOutput,
        timestamp: new Date(),
        error: isError,
      },
    ])

    // Announce command completion
    setLastCommandStatus(isError ? 'error' : 'success')
    if (isError) {
      announceError(finalOutput)
    } else {
      const outputLine = finalOutput ? (finalOutput.split('\n')[0] ?? '') : ''
      announce(`Command completed: ${outputLine}`, 'polite')
    }

    setInput('')
    setIsExecuting(false)
  }

  const handleAutocomplete = () => {
    const suggestions = processor.getAutocomplete(input)
    if (suggestions.length === 1) {
      const suggestion = suggestions[0] ?? ''
      setInput(suggestion)
      announce(`Autocompleted to: ${suggestion}`, 'polite')
    } else if (suggestions.length > 1) {
      // Show suggestions in output
      const suggestionText = suggestions.join('  ')
      setHistory(prev => [
        ...prev,
        {
          command: input,
          output: suggestionText,
          timestamp: new Date(),
        },
      ])
      announce(`${suggestions.length.toString()} autocomplete suggestions shown`, 'polite')
    } else {
      announce('No autocomplete suggestions available', 'polite')
    }
  }

  const formatOutput = (output: string): React.ReactNode => {
    if (!output) return null

    // Hard cap to avoid rendering extremely large outputs accidentally
    const MAX_CHARS = 50_000
    if (output.length > MAX_CHARS) {
      output = output.slice(0, MAX_CHARS) + '\n\x1b[33m[truncated]\x1b[39m'
    }
    // ANSI parser for SGR codes (very small subset)
    const urlRegex = /(https?:\/\/[^\s]+)/g
    // eslint-disable-next-line no-control-regex
    const ANSI_PATTERN = new RegExp('\\x1b\\[([0-9;]+)m', 'g') // e.g., \x1b[31m or \x1b[1;32m

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
        const index = match.index || 0
        if (index > lastIndex) parts.push(text.slice(lastIndex, index))
        parts.push({ url })
        lastIndex = index + url.length
      }
      if (lastIndex < text.length) parts.push(text.slice(lastIndex))
      if (parts.length === 0) parts.push(text)
      return parts.map((p, j) =>
        typeof p === 'string' ? (
          <span key={`text-${String(j)}-${p.slice(0, 10)}`}>{p}</span>
        ) : (
          <a
            key={`url-${String(j)}-${p.url}`}
            href={p.url}
            target='_blank'
            rel='noopener noreferrer'
            className='underline text-cyan-bright focus:outline-none focus:ring-2 focus:ring-cyan-bright focus:ring-opacity-50 rounded'
            aria-label={`External link: ${p.url}`}
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
        const { index: idx } = match
        if (idx > lastIndex) {
          segments.push({ text: line.slice(lastIndex, idx), classes: stateToClass(state) })
        }
        const codes = match[1]?.split(';').map(n => Number(n || '0')) ?? []
        for (const code of codes) state = applyCode(state, code)
        const { lastIndex: newLastIndex } = ANSI_PATTERN
        lastIndex = newLastIndex
      }
      if (lastIndex < line.length) {
        segments.push({ text: line.slice(lastIndex), classes: stateToClass(state) })
      }

      return (
        <div key={`line-${String(i)}`} className='whitespace-pre-wrap'>
          {segments.map((seg, k) => (
            <span
              key={`segment-${String(i)}-${String(k)}-${seg.text.slice(0, 10)}`}
              className={seg.classes}
            >
              {renderTextWithLinks(seg.text)}
            </span>
          ))}
        </div>
      )
    }

    return output.split('\n').map((line, i) => renderLine(line, i))
  }

  return (
    <div
      ref={terminalRef}
      className='h-full flex flex-col font-mono text-[12.5px] leading-[1.5] text-[rgba(235,241,255,0.9)]'
      role='application'
      aria-label='Interactive Terminal'
      aria-describedby='terminal-help terminal-status'
    >
      {/* Status announcement for screen readers */}
      <div id='terminal-status' className='sr-only' aria-live='polite' aria-atomic='true'>
        {isExecuting
          ? 'Command executing...'
          : lastCommandStatus === 'error'
            ? 'Last command failed'
            : lastCommandStatus === 'success'
              ? 'Last command completed successfully'
              : 'Terminal ready for commands'}
      </div>

      {/* Terminal Content */}
      <div
        ref={outputRef}
        className='flex-1 overflow-y-auto'
        id='terminal-content'
        role='log'
        aria-live='polite'
        aria-label='Terminal command output'
        aria-describedby='terminal-help'
        tabIndex={-1}
      >
        {/* Command History */}
        <div className='terminal-output space-y-2'>
          {history.map((entry, index) => (
            <div key={`history-${String(index)}-${entry.command}`}>
              <div className='flex'>
                <span className='font-semibold'>
                  <span className='text-green-400'>user@</span>
                  <span className='text-pink-400'>portfolio</span>
                  <span className='text-green-400'>:~$</span>
                </span>
                <span className='ml-2 text-cyan-bright'>{entry.command}</span>
              </div>
              {entry.output && (
                <div
                  className={`ml-4 mb-2 ${entry.error ? 'text-terminal-red' : 'text-[rgba(235,241,255,0.9)]'}`}
                >
                  {formatOutput(entry.output)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Current Command Line */}
        <div className='flex items-center' role='group' aria-label='Command input'>
          <span className='font-semibold' aria-hidden='true'>
            <span className='text-green-400'>user@</span>
            <span className='text-pink-400'>portfolio</span>
            <span className='text-green-400'>:~$</span>
          </span>
          <label htmlFor='terminal-input' className='sr-only'>
            Terminal command input. Use Tab for autocomplete, up and down arrows for command
            history.
          </label>
          <input
            ref={inputRef}
            id='terminal-input'
            type='text'
            value={input}
            onChange={e => {
              setInput(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            className='ml-2 bg-transparent border-none outline-none text-[rgba(0,234,255,0.9)] font-mono text-[12.5px] leading-[1.5] flex-1 focus-visible:shadow-[0_0_0_2px_rgba(0,234,255,0.3)] focus-visible:rounded-sm'
            aria-label='Terminal command input'
            aria-describedby='terminal-help terminal-status'
            aria-invalid={lastCommandStatus === 'error' ? 'true' : 'false'}
            autoComplete='off'
            spellCheck='false'
            placeholder={isExecuting ? 'Command executing...' : 'Type a command...'}
            disabled={isExecuting}
            aria-multiline='false'
          />
          <span
            className={`cursor-block ${isExecuting ? 'animate-pulse' : ''}`}
            aria-hidden='true'
          />
        </div>
      </div>

      {/* Command Help Footer */}
      <div
        id='terminal-help'
        className='px-3 py-2 border-t border-[rgba(128,255,128,0.25)] text-xs text-text-soft bg-black/20'
        role='complementary'
        aria-label='Terminal keyboard shortcuts'
      >
        <div className='flex flex-wrap gap-4'>
          <span>
            <kbd className='bg-black/40 px-1 rounded' aria-label='Tab key'>
              Tab
            </kbd>
            <span className='sr-only'>key for </span>autocomplete
          </span>
          <span>
            <kbd className='bg-black/40 px-1 rounded' aria-label='Up and down arrow keys'>
              ↑↓
            </kbd>
            <span className='sr-only'>keys for </span>history
          </span>
          <span>
            <kbd className='bg-black/40 px-1 rounded' aria-label='Control plus C'>
              Ctrl+C
            </kbd>
            <span className='sr-only'>to </span>clear
          </span>
          <span>
            <kbd className='bg-black/40 px-1 rounded' aria-label='Control plus L'>
              Ctrl+L
            </kbd>
            <span className='sr-only'>to </span>clear screen
          </span>
        </div>
      </div>
    </div>
  )
}
