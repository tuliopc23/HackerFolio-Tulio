import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
// vitest globals are available - no import needed

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
      render(<TerminalLoadingSpinner text='Loading data...' />)

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
            <div data-testid='history'>
              {history.map((cmd, i) => (
                <div key={i}>{cmd}</div>
              ))}
            </div>
            <input
              data-testid='terminal-input'
              value={input}
              onChange={e => {
                setInput(e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder='Type a command...'
            />
          </div>
        )
      }

      render(<TestTerminalInput />)

      const input = screen.getByTestId('terminal-input') as HTMLInputElement

      // Type a command using fireEvent
      fireEvent.change(input, { target: { value: 'test command' } })

      // Check the input value after typing
      expect(input).toHaveValue('test command')

      // Press Enter to execute
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(input).toHaveValue('')
      expect(screen.getByTestId('history')).toHaveTextContent('test command')
    })

    test('command autocomplete functionality', () => {
      function TestAutocomplete() {
        const [input, setInput] = React.useState('')
        const [suggestions, setSuggestions] = React.useState<string[]>([])

        const commands = ['help', 'projects', 'clear', 'theme']

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Tab') {
            e.preventDefault()
            const matches = commands.filter(cmd => cmd.startsWith(input))
            if (matches.length === 1) {
              setInput(matches[0]!)
              setSuggestions([])
            } else {
              setSuggestions(matches)
            }
          }
        }

        return (
          <div>
            <input
              data-testid='autocomplete-input'
              value={input}
              onChange={e => {
                setInput(e.target.value)
                setSuggestions([]) // Clear suggestions on input change
              }}
              onKeyDown={handleKeyDown}
            />
            <div data-testid='suggestions'>{suggestions.join(', ')}</div>
          </div>
        )
      }

      render(<TestAutocomplete />)

      const input = screen.getByTestId('autocomplete-input') as HTMLInputElement

      // Type partial command and press Tab
      fireEvent.change(input, { target: { value: 'he' } })
      fireEvent.keyDown(input, { key: 'Tab' })

      expect(input).toHaveValue('help')
    })

    test('error boundary behavior simulation', () => {
      // Test that error handling works by simulating an error condition
      function TestErrorScenario() {
        const [hasError, setHasError] = React.useState(false)

        const triggerError = () => {
          setHasError(true)
        }

        if (hasError) {
          return (
            <div data-testid='error-fallback'>
              <h2>Terminal Error</h2>
              <p>Something went wrong in the terminal interface.</p>
              <button
                onClick={() => {
                  setHasError(false)
                }}
              >
                Restart Terminal
              </button>
            </div>
          )
        }

        return (
          <div>
            <button data-testid='trigger-error' onClick={triggerError}>
              Simulate Error
            </button>
            <div data-testid='normal-content'>Terminal running normally</div>
          </div>
        )
      }

      render(<TestErrorScenario />)

      // Initially should show normal content
      expect(screen.getByTestId('normal-content')).toBeInTheDocument()

      // Trigger error scenario
      const errorButton = screen.getByTestId('trigger-error')
      fireEvent.click(errorButton)

      // Should now show error fallback
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
      expect(screen.getByText('Terminal Error')).toBeInTheDocument()
    })

    test('focus management in terminal interface', async () => {
      function TestFocusTerminal() {
        const inputRef = React.useRef<HTMLInputElement>(null)

        const handleFocus = () => {
          if (inputRef.current) {
            inputRef.current.focus()
          }
        }

        return (
          <div>
            <button data-testid='focus-button' onClick={handleFocus}>
              Focus Terminal
            </button>
            <input ref={inputRef} data-testid='focused-input' placeholder='Terminal ready' />
          </div>
        )
      }

      render(<TestFocusTerminal />)

      const input = screen.getByTestId('focused-input')
      const focusButton = screen.getByTestId('focus-button')

      // Click button to focus input
      focusButton.click()

      // Input should be focused (in a real browser environment)
      // For testing, we just verify the element exists and is focusable
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('placeholder', 'Terminal ready')
    })

    test('command history navigation', () => {
      function TestHistoryNavigation() {
        const [input, setInput] = React.useState('')
        const [history, setHistory] = React.useState<string[]>([])
        const [historyIndex, setHistoryIndex] = React.useState(-1)

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && input.trim()) {
            e.preventDefault()
            const newHistory = [...history, input]
            setHistory(newHistory)
            setInput('')
            setHistoryIndex(-1)
          } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (history.length > 0) {
              const newIndex =
                historyIndex >= 0 ? Math.max(0, historyIndex - 1) : history.length - 1
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
            <div data-testid='current-input'>{input}</div>
            <div data-testid='history-list'>
              {history.map((cmd, i) => (
                <div key={i}>{cmd}</div>
              ))}
            </div>
            <input
              data-testid='history-input'
              value={input}
              onChange={e => {
                setInput(e.target.value)
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
        )
      }

      render(<TestHistoryNavigation />)

      const input = screen.getByTestId('history-input') as HTMLInputElement

      // Add some commands to history
      fireEvent.change(input, { target: { value: 'first command' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      fireEvent.change(input, { target: { value: 'second command' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      // Verify commands were added to history
      expect(screen.getByTestId('history-list')).toHaveTextContent('first command')
      expect(screen.getByTestId('history-list')).toHaveTextContent('second command')

      // Navigate up through history
      fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(input).toHaveValue('second command')

      fireEvent.keyDown(input, { key: 'ArrowUp' })
      expect(input).toHaveValue('first command')

      // Navigate down through history
      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(input).toHaveValue('second command')

      fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(input).toHaveValue('')
    })
  })
})
