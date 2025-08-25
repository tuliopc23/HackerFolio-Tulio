import { render, type RenderOptions } from '@testing-library/react'
import React, { type ReactElement } from 'react'
import { expect, vi } from 'vitest'

import { ThemeProvider } from '@/components/terminal/theme-context'

// Create a custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
  theme?: 'lumon' | 'neon' | 'mono'
}

function AllTheProviders({
  children,
  theme = 'lumon',
}: {
  children: React.ReactNode
  theme?: 'lumon' | 'neon' | 'mono'
}) {
  // Ensure theme classes are applied to document element for testing
  React.useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-lumon', 'theme-neon', 'theme-mono')
    if (theme !== 'lumon') {
      root.classList.add(`theme-${theme}`)
    }
  }, [theme])

  return (
    <ThemeProvider>
      <div className='crt-screen'>{children}</div>
    </ThemeProvider>
  )
}

const customRender = (ui: ReactElement, { theme, ...options }: CustomRenderOptions = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders theme={theme ?? 'lumon'}>{children}</AllTheProviders>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Common test constants
export const TEST_CONSTANTS = {
  TERMINAL_COMMANDS: {
    HELP: 'help',
    PROJECTS: 'projects',
    ABOUT: 'about',
    CLEAR: 'clear',
    INVALID: 'invalid-command',
  },
  MOCK_PROJECT: {
    id: 1,
    title: 'Test Project',
    description: 'A test project description',
    technologies: ['React', 'TypeScript'],
    github_url: 'https://github.com/test/project',
    live_url: 'https://test-project.com',
    status: 'active' as const,
    featured: true,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z',
  },
  THEME_CLASSES: {
    LUMON: 'theme-lumon',
    NEON: 'theme-neon',
    MONO: 'theme-mono',
  },
  CSS_CLASSES: {
    TERMINAL_WINDOW: 'bg-lumon-bg border border-magenta-soft',
    ERROR_BOUNDARY: 'bg-lumon-bg border border-terminal-red',
    TERMINAL_OUTPUT: 'terminal-output',
    PHOSPHOR_GLOW: 'phosphor-glow',
  },
} as const

// Common test helpers
export const waitForElement = (selector: string, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (element) {
      resolve(element)
      return
    }

    const timeoutId = setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element with selector "${selector}" not found within ${String(timeout)}ms`))
    }, timeout)

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector)
      if (element) {
        clearTimeout(timeoutId)
        observer.disconnect()
        resolve(element)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

export const mockConsoleError = () => {
  const originalError = console.error
  const mockError = vi.fn()
  console.error = mockError

  return {
    mockError,
    restore: () => {
      console.error = originalError
    },
  }
}

// Mock API responses
export const createMockApiResponse = (data: unknown, status = 200) => {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response
}

// Helper to test CSS custom properties
export const expectCSSProperty = (
  element: HTMLElement,
  property: string,
  expectedValue?: string
) => {
  const computedStyle = window.getComputedStyle(element)
  const actualValue = computedStyle.getPropertyValue(property)

  if (expectedValue) {
    expect(actualValue).toBe(expectedValue)
  } else {
    expect(actualValue).toBeTruthy()
  }

  return actualValue
}

// Helper to simulate terminal input
export const simulateTerminalInput = async (input: HTMLInputElement, command: string) => {
  const { fireEvent } = await import('@testing-library/react')

  fireEvent.change(input, { target: { value: command } })
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
}

// Helper to wait for animations
export const waitForAnimation = (duration = 300) => {
  return new Promise(resolve => setTimeout(resolve, duration))
}
