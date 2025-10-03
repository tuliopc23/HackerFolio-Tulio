import { useNavigate } from '@tanstack/react-router'
import { ArrowUpDown, ClipboardCopy, Keyboard, Monitor } from 'lucide-react'
import { useState, useEffect, useRef, useCallback, type KeyboardEvent, memo } from 'react'

import { useFocusRegistration } from '@/components/accessibility/focus-manager'
import { useTerminalAccessibility } from '@/hooks/use-accessibility'
import { useIsMobile } from '@/hooks/use-media-query'
import { useExecuteCommand, useCommands, type ServerCommandResult } from '@/lib/queries'

import asciiArt from '@/assets/ascii desktop.svg'
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
  showPrompt?: boolean
  svg?: string
}

// Extracted to top-level to satisfy react/no-unstable-nested-components
const HistoryEntry = memo(
  ({ entry, isOldEntry }: { entry: TerminalHistory; isOldEntry: boolean }) => {
    const isBanner = entry.id.startsWith('art-') || entry.id.startsWith('tip-')
    return (
      <div key={entry.id} className={isBanner ? 'pb-8' : undefined}>
        {entry.command ? (
          <div className='flex'>
            <span className='terminal-prompt'>
              <span className='text-[#42be65]'>user@</span>
              <span className='text-[#ff7eb6]'>portfolio</span>
              <span className='text-[#42be65]'>:~$</span>
            </span>
            <span className='ml-2 text-cyan-bright terminal-prompt'>{entry.command}</span>
          </div>
        ) : null}
        {!entry.command && entry.showPrompt ? (
          <div className='flex' aria-hidden='true'>
            <span className='terminal-prompt'>
              <span className='text-[#42be65]'>user@</span>
              <span className='text-[#ff7eb6]'>portfolio</span>
              <span className='text-[#42be65]'>:~$</span>
            </span>
          </div>
        ) : null}
        {entry.svg ? (
          <div className='w-full' aria-hidden='true'>
            <img
              src={entry.svg}
              alt=''
              className='w-[340px] md:w-[580px] lg:w-[800px] h-auto'
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        ) : entry.output ? (
          <div className={
            entry.id.startsWith('tip-')
              ? 'text-[1.06em]'
              : entry.id.startsWith('art-')
                ? 'text-[9px] md:text-[10px] lg:text-[14px]'
                : undefined
          }>
            <TypedTerminalOutput
              output={entry.output}
              isError={entry.error ?? false}
              animate={!isOldEntry || isBanner}
              ariaHidden={entry.id.startsWith('art-')}
            />
          </div>
        ) : null}
      </div>
    )
  }
)
HistoryEntry.displayName = 'HistoryEntry'

export default function TerminalPane() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const isMobile = useIsMobile()
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

  const createWelcomeState = useCallback(() => {
    const boot = `\x1b[36mInitializing secure connection...\x1b[39m\n\x1b[32m✓ Connection established\x1b[39m`
    const bootEntry = {
      command: '',
      output: boot,
      timestamp: new Date(),
      id: `boot-${String(Date.now())}-${Math.random().toString(36).slice(2, 9)}`,
    }

    const tip = `\x1b[36mType \x1b[53m\x1b[32mhelp\x1b[55m\x1b[39m \x1b[36mfor tutorial\x1b[39m\n`

    return [
      bootEntry,
      {
        command: '',
        output: '',
        svg: asciiArt,
        timestamp: new Date(),
        id: `art-${String(Date.now())}-${Math.random().toString(36).slice(2, 9)}`,
        showPrompt: true,
      },
      {
        command: '',
        output: tip,
        timestamp: new Date(),
        id: `tip-${String(Date.now())}-${Math.random().toString(36).slice(2, 9)}`,
        showPrompt: true,
      },
    ]
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      announce('Terminal initialized and ready for commands', 'polite')
    }
    setHistory(prev => {
      if (prev.length > 0) return prev
      return createWelcomeState()
    })
  }, [announce, createWelcomeState])

  useEffect(() => {
    // Set server commands for autocomplete enrichment when commands data loads
    if (commands) {
      processor.setServerCommands(commands.map(c => c.command))
    }
  }, [commands, processor])

  useEffect(() => {
    if (history.length > 0 && outputRef.current) {
      const el = outputRef.current
      const threshold = 8
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - threshold
      if (atBottom) {
        el.scrollTop = el.scrollHeight
      }
    }
  }, [history.length])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isExecuting) {
        announce('Command is already executing, please wait', 'assertive')
        return
      }
      void runCommand(input)
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault()
      void copyLastOutput()
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
      setHistory(createWelcomeState())
      announce('Terminal cleared and reset to welcome state', 'polite')
    }
  }

  const copyLastOutput = async () => {
    const last = [...history].reverse().find(h => h.output && h.output.trim().length > 0)
    const text = last?.output ?? ''
    if (!text) {
      announce('No output to copy', 'polite')
      return
    }
    try {
      // eslint-disable-next-line no-control-regex
      await navigator.clipboard.writeText(text.replace(/\x1b\[[0-9;]+m/g, ''))
      announce('Copied output to clipboard', 'polite')
    } catch {
      announce('Clipboard copy failed', 'assertive')
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
        setHistory(createWelcomeState())
        setInput('')
        setIsExecuting(false)
        announce('Terminal cleared and reset to welcome state', 'polite')
        return
      }

      // Handle OPEN_URL command
      if (result.output.startsWith('OPEN_URL:')) {
        const url = result.output.substring(9)
        window.open(url, '_blank', 'noopener,noreferrer')
        setHistory(prev => [
          ...prev,
          {
            command,
            output: `\x1b[32mOpening ${url} in new tab...\x1b[39m`,
            timestamp: new Date(),
            error: false,
            id: `cmd-${Date.now().toString()}-${Math.random().toString(36).slice(2, 9)}`,
          },
        ])
        setInput('')
        setIsExecuting(false)
        announce(`Opening ${url} in new tab`, 'polite')
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
        finalError = !!serverResult.error

        // Handle OPEN_URL from server response
        if (finalOutput.startsWith('OPEN_URL:')) {
          const url = finalOutput.substring(9)
          window.open(url, '_blank', 'noopener,noreferrer')
          finalOutput = `\x1b[32mOpening ${url} in new tab...\x1b[39m`
          finalError = false
          announce(`Opening ${url} in new tab`, 'polite')
        }
      } catch (err) {
        if (err instanceof Error) {
          finalOutput = err.message
        } else {
          finalOutput = 'An unknown error occurred'
        }
        finalError = true
      }

      // Add to history with final output
      const isError = finalError

      const MAX_HISTORY = 1000
      setHistory(prev => {
        const next = [
          ...prev,
          {
            command,
            output: finalOutput,
            timestamp: new Date(),
            error: isError,
            id: `cmd-${Date.now().toString()}-${Math.random().toString(36).slice(2, 9)}`,
          },
        ]
        if (next.length > MAX_HISTORY) {
          return next.slice(next.length - MAX_HISTORY)
        }
        return next
      })

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
      processor,
      navigate,
      setTheme,
      executeCommand,
      announceCommand,
      announceError,
      announce,
      createWelcomeState,
    ]
  )

  // Uses top-level HistoryEntry memoized component

  // Virtualization replaces manual slicing of history

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
      className='h-full flex flex-col font-mono text-terminal-body terminal-body text-[rgba(235,241,255,0.9)]'
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
        className='flex-1 overflow-y-auto ios-inertia content-visibility-auto composite-layer'
        id='terminal-content'
        role='log'
        aria-live='polite'
        aria-label='Terminal command output'
        aria-describedby='terminal-help'
        tabIndex={-1}
      >
        {history.map((entry, idx) => {
          const isOldEntry = history.length - 1 - idx > 1
          return (
            <div key={entry.id} className='terminal-output pb-2'>
              <HistoryEntry entry={entry} isOldEntry={isOldEntry} />
            </div>
          )
        })}

        {/* Current Command Line */}
        <div className='flex items-center' role='group' aria-label='Command input'>
          <span className='terminal-prompt pr-1.5' aria-hidden='true'>
            <span className='text-[#42be65]'>user@</span>
            <span className='text-[#ff7eb6]'>portfolio</span>
            <span className='text-[#42be65]'>:~$</span>
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
            className='ml-3 bg-transparent border-none outline-none text-[color:var(--term-fg)] text-terminal-prompt flex-1'
            aria-label='Terminal command input'
            aria-describedby='terminal-help terminal-status'
            aria-invalid={lastCommandStatus === 'error' ? 'true' : 'false'}
            autoComplete='off'
            spellCheck='false'
            placeholder={isExecuting ? 'Command executing...' : 'Type a command...'}
            disabled={isExecuting}
            aria-multiline='false'
          />
          {/* Removed decorative cursor block to avoid confusion with real caret */}
        </div>
      </div>

      {/* Command Help Footer */}
      <div
        id='terminal-help'
        className='px-3 py-2 border-t border-[rgba(255,126,182,0.25)] text-terminal-header terminal-caption bg-black/20'
        role='complementary'
        aria-label='Terminal keyboard shortcuts'
      >
        <div className='flex flex-wrap items-center gap-4'>
          <span className='inline-flex items-center gap-2 text-terminal-green'>
            <Keyboard className='h-4 w-4' aria-hidden='true' />
            <span>Tab for autocomplete</span>
          </span>
          <span className='inline-flex items-center gap-2 text-terminal-green'>
            <ArrowUpDown className='h-4 w-4' aria-hidden='true' />
            <span>History navigation</span>
          </span>
          <span className='inline-flex items-center gap-2 text-terminal-green'>
            <Monitor className='h-4 w-4' aria-hidden='true' />
            <span>Ctrl+L clears screen</span>
          </span>
          <button
            type='button'
            onClick={() => void copyLastOutput()}
            className='ml-auto inline-flex items-center gap-2 rounded border border-[#393939] px-2 py-1 text-terminal-label text-[#33b1ff] hover:bg-[#393939] hover:bg-opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#33b1ff] focus:ring-opacity-50'
            aria-label='Copy last output (Ctrl/Cmd+Shift+C)'
            title='Copy last output (Ctrl/Cmd+Shift+C)'
          >
            <ClipboardCopy className='h-4 w-4' aria-hidden='true' />
            <span className='sr-only'>Copy last output</span>
          </button>
        </div>
      </div>
    </div>
  )
}
