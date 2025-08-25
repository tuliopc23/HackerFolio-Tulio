import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Note: CSS is processed by Vitest automatically, no need to import here

// Extend Vitest's expect with Jest DOM matchers
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
  }
}

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Setup DOM environment with CSS variables and theme support
beforeAll(() => {
  // Setup CSS custom properties on document element
  const documentElement = document.documentElement
  documentElement.style.setProperty('--lumon-dark', 'hsl(0, 0%, 0%)')
  documentElement.style.setProperty('--lumon-bg', 'hsl(0, 0%, 3%)')
  documentElement.style.setProperty('--lumon-border', 'hsl(300, 30%, 15%)')
  documentElement.style.setProperty('--lumon-text', 'hsl(180, 70%, 80%)')
  documentElement.style.setProperty('--cyan-bright', 'hsl(180, 100%, 50%)')
  documentElement.style.setProperty('--cyan-soft', 'hsl(180, 80%, 60%)')
  documentElement.style.setProperty('--neon-blue', 'hsl(180, 100%, 50%)')
  documentElement.style.setProperty('--text-cyan', 'hsl(180, 100%, 90%)')
  documentElement.style.setProperty('--text-soft', 'hsl(180, 70%, 80%)')
  documentElement.style.setProperty('--terminal-green', 'hsl(120, 100%, 63%)')
  documentElement.style.setProperty('--terminal-orange', 'hsl(30, 100%, 50%)')
  documentElement.style.setProperty('--terminal-red', 'hsl(356, 90%, 54%)')
  documentElement.style.setProperty('--magenta-bright', 'hsl(300, 100%, 60%)')
  documentElement.style.setProperty('--magenta-soft', 'hsl(310, 80%, 70%)')
  documentElement.style.setProperty('--magenta-glow', 'hsl(300, 100%, 80%)')

  // Set default theme class
  documentElement.className = 'theme-lumon'
  document.body.className = 'crt-screen'

  // Mock IntersectionObserver for components that use it
  global.IntersectionObserver = class {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any

  // Mock ResizeObserver for layout components
  global.ResizeObserver = class {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any

  // Mock matchMedia for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock HTMLElement.scrollIntoView for terminal scrolling
  Element.prototype.scrollIntoView = () => {}

  // Mock localStorage for theme persistence
  const localStorageMock = {
    getItem: vi.fn((key: string) => {
      if (key === 'terminal-theme') return 'lumon'
      return null
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Mock console methods to avoid noise in tests
  global.console = {
    ...console,
    // Keep error and warn for debugging
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  }

  // Mock fetch for API tests
  global.fetch = vi.fn() as any

  // Mock CSS animations for stable testing
  const mockGetComputedStyle = vi.fn(() => ({
    getPropertyValue: vi.fn((prop: string) => {
      const cssVars: Record<string, string> = {
        '--lumon-bg': 'hsl(0, 0%, 3%)',
        '--magenta-bright': 'hsl(300, 100%, 60%)',
        '--terminal-red': 'hsl(356, 90%, 54%)',
        '--terminal-green': 'hsl(120, 100%, 63%)',
        '--cyan-bright': 'hsl(180, 100%, 50%)',
      }
      return cssVars[prop] || ''
    }),
  }))
  window.getComputedStyle = mockGetComputedStyle as any
})

afterAll(() => {
  // Clean up mocks if needed
  vi.clearAllMocks()
})
