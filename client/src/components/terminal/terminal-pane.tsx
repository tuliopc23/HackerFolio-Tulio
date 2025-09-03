import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback, useMemo, type KeyboardEvent } from 'react'

import { useFocusRegistration } from '@/components/accessibility/focus-manager'
import { useTerminalAccessibility } from '@/hooks/use-accessibility'
import { useExecuteCommand, useCommands, type ServerCommandResult } from '@/lib/queries'

import { CommandProcessor, type CommandResult } from './command-processor'
import { useTheme } from './theme-context'
import TypedTerminalOutput from './typed-terminal-output'

interface TerminalHistory {
  command: string
  output: string
  timestamp: Date
  error?: boolean | undefined
  id: string
  isTyping?: boolean
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

  // TanStack Query hooks
  const { data: commands } = useCommands()
  const executeCommand = useExecuteCommand()

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
      const art = `\x1b[32m _____ _   _ _    ___ ___   \x1b[35m  ___ _   _ _  _ _  _   _   \x1b[39m\n\x1b[32m|_   _| | | | |  |_ _/ _ \\  \x1b[35m / __| | | | \\| | || | /_\\  \x1b[39m\n\x1b[32m  | | | |_| | |__ | | (_) |\x1b[35m | (__| |_| | .\` | __ |/ _ \\ \x1b[39m\n\x1b[32m  |_|  \\___/|____|___\\___/ \x1b[35m  \\___|\\___|_|\\_|_||_/_/ \\_\\\x1b[39m\n\x1b[92m        _    \x1b[95m __         \x1b[96m _                      \x1b[39m\n\x1b[92m       |_  ||\x1b[95m (__|_ _. _| \x1b[96m| \\ _    _ | _ ._  _ ._ \x1b[39m\n\x1b[92m       ||_|||\x1b[95m __)|_(_|(_|<\x1b[96m|_/(/_\\/(/_|(_)|_)(/_|  \x1b[39m\n\x1b[92m             \x1b[95m            \x1b[96m               |        \x1b[39m`
      const tip = `\x1b[35mTip\x1b[39m: Type \x1b[36mhelp\x1b[39m or \x1b[36mhelp projects\x1b[39m for flags`
      return [
        ...prev,
        { command: '', output: boot, timestamp: new Date(), id: 'boot-1' },
        { command: '', output: art, timestamp: new Date(), id: 'art-1' },
        { command: '', output: tip, timestamp: new Date(), id: 'tip-1' },
      ]
    })
  }, [announce])

  useEffect(() => {
    // Set server commands for autocomplete enrichment when commands data loads
    if (commands) {
      processor.setServerCommands(commands.map(c => c.command))
    }
  }, [commands, processor])

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

  // OPTIMIZATION: Memoize runCommand to prevent unnecessary re-renders
  const runCommand = useCallback(
    async (command: string) => {
      if (!command.trim()) return

      setIsExecuting(true)
      announceCommand(command)
      processor.addToHistory(command)
      const result: CommandResult = processor.processCommand(command)

      // Handle special commands
      if (result.output === 'CLEAR') {
        setHistory([])
        setInput('')
        setIsExecuting(false)
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

      // Execute server command using TanStack Query mutation
      const [rootCmd, ...rest] = command.split(' ')
      try {
        const cmd = rootCmd ?? ''
        const args = rest
        serverResult = await executeCommand.mutateAsync({ command: cmd, args })
        finalOutput = serverResult.output
        finalError = serverResult.error
      } catch (err) {
        if (err instanceof Error) {
          finalOutput = err.message
        } else {
          finalOutput = 'An unknown error occurred'
        }
        finalError = true
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
          id: `cmd-${Date.now().toString()}-${Math.random().toString(36).slice(2, 9)}`,
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
    },
    [
      isExecuting,
      processor,
      navigate,
      setTheme,
      executeCommand,
      announceCommand,
      announceError,
      announce,
    ]
  )

  // OPTIMIZATION: Virtualize history to show only recent entries for performance
  const visibleHistory = useMemo(() => {
    // Show last 50 entries to prevent performance issues with large histories
    return history.slice(Math.max(0, history.length - 50))
  }, [history])

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
          id: `autocomplete-${Date.now().toString()}-${Math.random().toString(36).slice(2, 9)}`,
        },
      ])
      announce(`${suggestions.length.toString()} autocomplete suggestions shown`, 'polite')
    } else {
      announce('No autocomplete suggestions available', 'polite')
    }
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
        {/* Command History - OPTIMIZED: Only render recent entries */}
        <div className='terminal-output space-y-2'>
          {visibleHistory.map((entry, index) => (
            <div key={`history-${entry.id}`}>
              <div className='flex'>
                <span className='font-semibold'>
                  <span className='text-green-400'>user@</span>
                  <span className='text-pink-400'>portfolio</span>
                  <span className='text-green-400'>:~$</span>
                </span>
                <span className='ml-2 text-cyan-bright'>{entry.command}</span>
              </div>
              {entry.output && (
                <TypedTerminalOutput
                  output={entry.output}
                  isError={entry.error ?? false}
                  animate={index < 5} // Only animate first 5 entries to avoid performance issues
                />
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
        className='px-3 py-2 border-t border-[rgba(128,255,128,0.25)] text-xs text-green-400 bg-black/20'
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
