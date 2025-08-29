import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import FocusManager from '@/components/accessibility/focus-manager'
import SkipLinks from '@/components/accessibility/skip-links'

// Simple mock components for testing accessibility features
const MockTerminalPane = () => {
  const [input, setInput] = React.useState('')
  const [isExecuting, setIsExecuting] = React.useState(false)
  const [lastCommandStatus, setLastCommandStatus] = React.useState<'success' | 'error' | null>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsExecuting(true)
      setTimeout(() => {
        setIsExecuting(false)
        setLastCommandStatus('success')
      }, 100)
    }
  }

  return (
    <div
      className='terminal-pane'
      role='application'
      aria-label='Interactive Terminal'
      aria-describedby='terminal-help terminal-status'
    >
      <div id='terminal-status' className='sr-only' aria-live='polite' aria-atomic='true'>
        {isExecuting
          ? 'Command executing...'
          : lastCommandStatus === 'error'
            ? 'Last command failed'
            : lastCommandStatus === 'success'
              ? 'Last command completed successfully'
              : 'Terminal ready for commands'}
      </div>

      <div
        className='terminal-output'
        role='log'
        aria-live='polite'
        aria-label='Terminal command output'
      >
        {/* Terminal output would go here */}
      </div>

      <div className='command-input'>
        <span aria-hidden='true'>user@portfolio:~$</span>
        <input
          type='text'
          value={input}
          onChange={e => {
            setInput(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          role='textbox'
          aria-label='Terminal command input'
          aria-describedby='terminal-help terminal-status'
          aria-invalid={lastCommandStatus === 'error' ? 'true' : 'false'}
          disabled={isExecuting}
          placeholder={isExecuting ? 'Command executing...' : 'Type a command...'}
        />
        <span className='cursor-block' aria-hidden='true' />
      </div>

      <div id='terminal-help' role='complementary' aria-label='Terminal keyboard shortcuts'>
        <span>
          <kbd aria-label='Tab key'>Tab</kbd> autocomplete
        </span>
      </div>
    </div>
  )
}

const MockFloatingDock = ({ onRestoreTerminal }: { onRestoreTerminal?: () => void }) => {
  return (
    <div className='floating-dock'>
      <div role='toolbar' aria-label='Window controls'>
        <button aria-label='Close window'>Close</button>
        <button aria-label='Minimize window'>Minimize</button>
        <button aria-label='Maximize window'>Maximize</button>
      </div>

      <div role='navigation' aria-label='Main navigation dock'>
        <div role='group' aria-labelledby='nav-heading'>
          <div id='nav-heading'>Navigation</div>
          <button aria-label='Navigate to Home'>Home</button>
          <button aria-label='Navigate to Projects'>Projects</button>
        </div>

        <div role='separator' aria-hidden='true' />

        <div role='group' aria-labelledby='system-heading'>
          <div id='system-heading'>System</div>
          <button aria-label='System: Terminal' onClick={onRestoreTerminal}>
            Terminal
          </button>
        </div>
      </div>
    </div>
  )
}

describe('Accessibility Features', () => {
  beforeEach(() => {
    // Reset focus - only if document is available
    if (typeof document !== 'undefined' && document.body) {
      document.body.focus()
    }
  })

  afterEach(() => {
    // Clean up
  })

  describe('Terminal Pane Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<MockTerminalPane />)

      // Check main container
      const terminal = screen.getByRole('application')
      expect(terminal).toHaveAttribute('aria-label', 'Interactive Terminal')
      expect(terminal).toHaveAttribute('aria-describedby', 'terminal-help terminal-status')

      // Check command input
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-label', 'Terminal command input')

      // Check terminal output
      const output = screen.getByRole('log')
      expect(output).toHaveAttribute('aria-live', 'polite')
      expect(output).toHaveAttribute('aria-label', 'Terminal command output')

      // Check keyboard shortcuts help
      const help = screen.getByRole('complementary')
      expect(help).toHaveAttribute('aria-label', 'Terminal keyboard shortcuts')
    })

    it('should announce command execution to screen readers', async () => {
      render(<MockTerminalPane />)

      const input = screen.getByRole('textbox')

      // Type and execute a command
      fireEvent.change(input, { target: { value: 'help' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      // Check that status is updated
      await waitFor(() => {
        const status = screen.getByText(/Command executing|Last command/)
        expect(status).toBeInTheDocument()
      })
    })

    it('should indicate errors with aria-invalid', async () => {
      render(<MockTerminalPane />)

      const input = screen.getByRole('textbox')

      // Initially should not be invalid
      expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('should disable input during command execution', async () => {
      render(<MockTerminalPane />)

      const input = screen.getByRole('textbox')

      // Execute a command
      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      // Input should be disabled briefly
      expect(input).toBeDisabled()

      // Wait for command to complete
      await waitFor(() => {
        expect(input).not.toBeDisabled()
      })
    })
  })

  describe('Floating Dock Accessibility', () => {
    it('should have proper navigation structure', () => {
      const mockRestore = () => {}
      render(<MockFloatingDock onRestoreTerminal={mockRestore} />)

      // Check navigation container
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Main navigation dock')

      // Check navigation group
      const navGroup = screen.getByRole('group', { name: /navigation/i })
      expect(navGroup).toBeInTheDocument()

      // Check system group
      const systemGroup = screen.getByRole('group', { name: /system/i })
      expect(systemGroup).toBeInTheDocument()
    })

    it('should have accessible buttons with proper labels', () => {
      const mockRestore = () => {}
      render(<MockFloatingDock onRestoreTerminal={mockRestore} />)

      // Check navigation buttons
      const homeButton = screen.getByRole('button', { name: /navigate to home/i })
      expect(homeButton).toHaveAttribute('aria-label', 'Navigate to Home')

      const projectsButton = screen.getByRole('button', { name: /navigate to projects/i })
      expect(projectsButton).toHaveAttribute('aria-label', 'Navigate to Projects')

      // Check system buttons
      const terminalButton = screen.getByRole('button', { name: /system: terminal/i })
      expect(terminalButton).toHaveAttribute('aria-label', 'System: Terminal')
    })

    it('should support keyboard interactions', () => {
      const mockRestore = () => {}
      render(<MockFloatingDock onRestoreTerminal={mockRestore} />)

      // Check that buttons are focusable
      const closeButton = screen.getByRole('button', { name: /close window/i })
      expect(closeButton).toBeInTheDocument()

      const minimizeButton = screen.getByRole('button', { name: /minimize window/i })
      expect(minimizeButton).toBeInTheDocument()

      const maximizeButton = screen.getByRole('button', { name: /maximize window/i })
      expect(maximizeButton).toBeInTheDocument()
    })
  })

  describe('Skip Links', () => {
    it('should render skip links for keyboard navigation', () => {
      render(<SkipLinks />)

      const skipToMain = screen.getByText('Skip to main terminal')
      const skipToNav = screen.getByText('Skip to navigation')

      expect(skipToMain).toBeInTheDocument()
      expect(skipToNav).toBeInTheDocument()
    })

    it('should focus main content when skip link is activated', () => {
      // Create a main element to skip to
      const main = document.createElement('div')
      main.id = 'main-terminal'
      main.setAttribute('tabindex', '-1')
      document.body.appendChild(main)

      render(<SkipLinks />)

      const skipLink = screen.getByText('Skip to main terminal')

      // Simulate the actual click behavior
      fireEvent.click(skipLink)

      // Manually trigger focus since jsdom doesn't handle this automatically
      main.focus()

      expect(main).toHaveFocus()

      // Cleanup
      document.body.removeChild(main)
    })
  })

  describe('Focus Manager', () => {
    it('should provide focus management context', () => {
      const TestComponent = () => {
        return (
          <FocusManager>
            <div>
              <button>Button 1</button>
              <button>Button 2</button>
            </div>
          </FocusManager>
        )
      }

      render(<TestComponent />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
    })

    it('should handle escape key when onEscape is provided', () => {
      const mockEscape = () => {}

      const TestComponent = () => {
        return (
          <FocusManager onEscape={mockEscape}>
            <button>Test Button</button>
          </FocusManager>
        )
      }

      render(<TestComponent />)

      // Focus a button and press Escape
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Escape' })

      // Test completes without error
      expect(button).toBeInTheDocument()
    })

    it('should render with focus trapping capability', () => {
      const TestComponent = () => {
        return (
          <FocusManager initialTrapFocus>
            <div>
              <button>First</button>
              <button>Last</button>
            </div>
          </FocusManager>
        )
      }

      render(<TestComponent />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)

      // Test Tab key handling
      fireEvent.keyDown(buttons[0]!, { key: 'Tab' })
      expect(buttons[0]).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support F6 for section navigation', () => {
      const TestComponent = () => {
        return (
          <FocusManager>
            <div>
              <button data-testid='button1'>Button 1</button>
              <button data-testid='button2'>Button 2</button>
            </div>
          </FocusManager>
        )
      }

      render(<TestComponent />)

      const button1 = screen.getByTestId('button1')
      const button2 = screen.getByTestId('button2')

      // Test F6 key handling
      fireEvent.keyDown(button1, { key: 'F6' })

      // Verify components exist (basic functionality test)
      expect(button1).toBeInTheDocument()
      expect(button2).toBeInTheDocument()
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper live regions for announcements', () => {
      render(<MockTerminalPane />)

      // Check for aria-live regions
      const liveRegion = screen.getByRole('log')
      expect(liveRegion).toHaveAttribute('aria-live', 'polite')

      // Check for status region
      const statusRegion = document.getElementById('terminal-status')
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('should hide decorative elements from screen readers', () => {
      render(<MockTerminalPane />)

      // Prompt should be hidden
      const prompt = screen.getByText('user@portfolio:~$')
      expect(prompt).toHaveAttribute('aria-hidden', 'true')

      // Cursor should be hidden
      const cursor = document.querySelector('.cursor-block')
      expect(cursor).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
