import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TerminalLoadingSpinner } from '@/components/loading-spinner'

describe('Terminal Components - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('TerminalLoadingSpinner', () => {
    test('renders with default text', () => {
      render(<TerminalLoadingSpinner />)
      
      expect(screen.getByText('Initializing...')).toBeInTheDocument()
    })

    test('renders with custom text', () => {
      render(<TerminalLoadingSpinner text="Loading data..." />)
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument()
    })

    test('has correct styling classes', () => {
      render(<TerminalLoadingSpinner />)
      
      const container = screen.getByText('Initializing...').parentElement
      expect(container).toHaveClass('flex', 'items-center', 'gap-3', 'text-cyan-bright')
    })

    test('contains loading dots', () => {
      const { container } = render(<TerminalLoadingSpinner />)
      
      const dots = container.querySelectorAll('.w-2.h-2.rounded-full')
      expect(dots).toHaveLength(3)
    })

    test('has mono font styling on text', () => {
      render(<TerminalLoadingSpinner />)
      
      const text = screen.getByText('Initializing...')
      expect(text).toHaveClass('text-sm', 'font-mono')
    })
  })

  describe('Terminal Interface Interactions', () => {
    test('terminal input handles keyboard interactions', async () => {
      const user = userEvent.setup()

      // Simple terminal input component for testing
      function TestTerminalInput() {
        const [input, setInput] = React.useState('')
        const [history, setHistory] = React.useState<string[]>([])

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            setHistory(prev => [...prev, input])
            setInput('')
          } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault()
            setInput('')
          } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault()
            setHistory([])
          }
        }

        return (
          <div>
            <div data-testid="history">
              {history.map((cmd, i) => (
                <div key={i}>{cmd}</div>
              ))}
            </div>
            <input
              data-testid="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
            />
          </div>
        )
      }

      render(<TestTerminalInput />)

      const input = screen.getByTestId('terminal-input')
      
      // Type a command
      await user.type(input, 'test command')
      expect(input).toHaveValue('test command')

      // Press Enter to execute
      await user.keyboard('{Enter}')
      expect(input).toHaveValue('')
      expect(screen.getByTestId('history')).toHaveTextContent('test command')

      // Test Ctrl+C to clear input
      await user.type(input, 'another command')
      await user.keyboard('{Control>}c{/Control}')
      expect(input).toHaveValue('')

      // Test Ctrl+L to clear history
      await user.type(input, 'final command')
      await user.keyboard('{Enter}')
      expect(screen.getByTestId('history')).toHaveTextContent('final command')
      
      await user.keyboard('{Control>}l{/Control}')
      expect(screen.getByTestId('history')).toHaveTextContent('')
    })

    test('command autocomplete functionality', async () => {
      const user = userEvent.setup()

      function TestAutocomplete() {
        const [input, setInput] = React.useState('')
        const [suggestions, setSuggestions] = React.useState<string[]>([])

        const commands = ['help', 'projects', 'clear', 'theme']

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Tab') {
            e.preventDefault()
            const matches = commands.filter(cmd => cmd.startsWith(input))
            if (matches.length === 1) {
              setInput(matches[0])
            } else {
              setSuggestions(matches)
            }
          }
        }

        return (
          <div>
            <input
              data-testid="autocomplete-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div data-testid="suggestions">
              {suggestions.join(', ')}
            </div>
          </div>
        )
      }

      render(<TestAutocomplete />)

      const input = screen.getByTestId('autocomplete-input')

      // Type partial command and press Tab
      await user.type(input, 'he')
      await user.keyboard('{Tab}')
      
      expect(input).toHaveValue('help')

      // Clear and test multiple matches
      await user.clear(input)
      await user.type(input, 'p')
      await user.keyboard('{Tab}')
      
      expect(screen.getByTestId('suggestions')).toHaveTextContent('projects')
    })

    test('error boundary catches component errors', () => {
      // Mock console.error to suppress error output during test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      function ErrorComponent() {
        throw new Error('Test error')
      }

      function TestErrorBoundary() {
        const [hasError, setHasError] = React.useState(false)

        if (hasError) {
          return (
            <div data-testid="error-fallback">
              <h2>Terminal Error</h2>
              <p>Something went wrong in the terminal interface.</p>
              <button onClick={() => setHasError(false)}>
                Restart Terminal
              </button>
            </div>
          )
        }

        try {
          return <ErrorComponent />
        } catch (error) {
          setHasError(true)
          return null
        }
      }

      render(<TestErrorBoundary />)

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
      expect(screen.getByText('Terminal Error')).toBeInTheDocument()

      consoleError.mockRestore()
    })

    test('focus management in terminal interface', () => {
      function TestFocusTerminal() {
        const inputRef = React.useRef<HTMLInputElement>(null)

        React.useEffect(() => {
          // Auto-focus terminal input on mount
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }, [])

        return (
          <div>
            <input
              ref={inputRef}
              data-testid="focused-input"
              placeholder="Terminal ready"
            />
          </div>
        )
      }

      render(<TestFocusTerminal />)

      const input = screen.getByTestId('focused-input')
      expect(input).toHaveFocus()
    })

    test('command history navigation', async () => {
      const user = userEvent.setup()

      function TestHistoryNavigation() {
        const [input, setInput] = React.useState('')
        const [history, setHistory] = React.useState<string[]>([])
        const [historyIndex, setHistoryIndex] = React.useState(-1)

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && input.trim()) {
            e.preventDefault()
            setHistory(prev => [...prev, input])
            setInput('')
            setHistoryIndex(-1)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (history.length > 0) {
              const newIndex = historyIndex >= 0 ? 
                Math.max(0, historyIndex - 1) : 
                history.length - 1
              setHistoryIndex(newIndex)
              setInput(history[newIndex] || '')
            }
          } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (historyIndex >= 0) {
              const newIndex = historyIndex + 1
              if (newIndex >= history.length) {
                setHistoryIndex(-1)
                setInput('')
              } else {
                setHistoryIndex(newIndex)
                setInput(history[newIndex] || '')
              }
            }
          }
        }

        return (
          <div>
            <div data-testid="current-input">{input}</div>
            <input
              data-testid="history-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        )
      }

      render(<TestHistoryNavigation />)

      const input = screen.getByTestId('history-input')

      // Add some commands to history
      await user.type(input, 'first command')
      await user.keyboard('{Enter}')
      await user.type(input, 'second command')
      await user.keyboard('{Enter}')

      // Navigate up through history
      await user.keyboard('{ArrowUp}')
      expect(screen.getByTestId('current-input')).toHaveTextContent('second command')

      await user.keyboard('{ArrowUp}')
      expect(screen.getByTestId('current-input')).toHaveTextContent('first command')

      // Navigate down through history
      await user.keyboard('{ArrowDown}')
      expect(screen.getByTestId('current-input')).toHaveTextContent('second command')

      await user.keyboard('{ArrowDown}')
      expect(screen.getByTestId('current-input')).toHaveTextContent('')
    })
  })
})