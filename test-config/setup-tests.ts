import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'

// CSS Integration: Vitest processes CSS automatically with css: true
// Note: CSS modules and Tailwind classes are processed by Vitest automatically

// Extend Vitest's expect with Jest DOM matchers
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
  }
}

// Enhanced CSS Variables Setup with complete theme definitions
const setupCSSVariables = () => {
  const { documentElement } = document

  // Lumon theme CSS variables
  const lumonTheme = {
    '--lumon-dark': 'hsl(0, 0%, 0%)',
    '--lumon-bg': 'hsl(0, 0%, 3%)',
    '--lumon-border': 'hsl(300, 30%, 15%)',
    '--lumon-text': 'hsl(180, 70%, 80%)',
    '--cyan-bright': 'hsl(180, 100%, 50%)',
    '--cyan-soft': 'hsl(180, 80%, 60%)',
    '--neon-blue': 'hsl(180, 100%, 50%)',
    '--text-cyan': 'hsl(180, 100%, 90%)',
    '--text-soft': 'hsl(180, 70%, 80%)',
    '--terminal-green': 'hsl(120, 100%, 63%)',
    '--terminal-orange': 'hsl(30, 100%, 50%)',
    '--terminal-red': 'hsl(356, 90%, 54%)',
    '--magenta-bright': 'hsl(300, 100%, 60%)',
    '--magenta-soft': 'hsl(310, 80%, 70%)',
    '--magenta-glow': 'hsl(300, 100%, 80%)',
    // Additional CSS variables for completeness
    '--background': '224 71% 4%',
    '--foreground': '213 31% 91%',
    '--primary': '210 40% 98%',
    '--primary-foreground': '222.2 47.4% 11.2%',
    '--muted': '223 47% 11%',
    '--muted-foreground': '215.4 16.3% 56.9%',
    '--accent': '216 34% 17%',
    '--accent-foreground': '210 40% 98%',
    '--border': '216 34% 17%',
    '--input': '216 34% 17%',
    '--ring': '224 71% 4%',
  }

  // Apply all CSS variables
  Object.entries(lumonTheme).forEach(([property, value]) => {
    documentElement.style.setProperty(property, value)
  })

  // Set theme classes
  documentElement.className = 'theme-lumon dark'
  document.body.className = 'crt-screen bg-background text-foreground'
}

// Enhanced getComputedStyle mock with all CSS variables
const createMockGetComputedStyle = () => {
  return vi.fn(() => ({
    getPropertyValue: vi.fn((prop: string) => {
      const cssVars: Record<string, string> = {
        // Theme variables
        '--lumon-bg': 'hsl(0, 0%, 3%)',
        '--lumon-text': 'hsl(180, 70%, 80%)',
        '--magenta-bright': 'hsl(300, 100%, 60%)',
        '--terminal-red': 'hsl(356, 90%, 54%)',
        '--terminal-green': 'hsl(120, 100%, 63%)',
        '--cyan-bright': 'hsl(180, 100%, 50%)',
        // Tailwind CSS variables
        '--background': '224 71% 4%',
        '--foreground': '213 31% 91%',
        '--primary': '210 40% 98%',
        '--muted': '223 47% 11%',
        '--border': '216 34% 17%',
        '--ring': '224 71% 4%',
        // CSS properties
        display: 'block',
        visibility: 'visible',
        opacity: '1',
        transform: 'none',
        transition: 'none',
        animation: 'none',
      }
      return cssVars[prop] || ''
    }),
    // Additional properties that components might check
    display: 'block',
    visibility: 'visible',
    opacity: '1',
  }))
}

// Cleanup after each test
afterEach(() => {
  cleanup()
  // Reset any dynamic styles that tests might have added
  document.head.querySelectorAll('style[data-test]').forEach(el => {
    el.remove()
  })
})

// Setup DOM environment with CSS variables and theme support
beforeAll(() => {
  // Setup CSS custom properties and theme
  setupCSSVariables()

  // Mock IntersectionObserver for components that use it
  global.IntersectionObserver = class IntersectionObserver {
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
      // Store callback for potential testing
    }
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
    readonly root: Element | Document | null = null
    readonly rootMargin: string = '0px'
    readonly thresholds: readonly number[] = []
  } as any

  // Mock ResizeObserver for layout components
  global.ResizeObserver = class ResizeObserver {
    constructor(_callback: ResizeObserverCallback) {
      // Store callback for potential testing
    }
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any

  // Enhanced matchMedia mock for responsive components
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('max-width: 768px') ? false : true, // Default to desktop
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  })

  // Mock HTMLElement methods for terminal and layout components
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.scrollTo = vi.fn()
  HTMLElement.prototype.focus = vi.fn()
  HTMLElement.prototype.blur = vi.fn()
  HTMLElement.prototype.click = vi.fn()

  // Enhanced localStorage mock for theme persistence
  const localStorageMock = {
    store: new Map<string, string>(),
    getItem: vi.fn((key: string) => {
      if (key === 'terminal-theme') return 'lumon'
      if (key === 'theme') return 'dark'
      return localStorageMock.store.get(key) || null
    }),
    setItem: vi.fn((key: string, value: string) => {
      localStorageMock.store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      localStorageMock.store.delete(key)
    }),
    clear: vi.fn(() => {
      localStorageMock.store.clear()
    }),
    length: 0,
    key: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Mock sessionStorage as well
  Object.defineProperty(window, 'sessionStorage', {
    value: { ...localStorageMock, store: new Map<string, string>() },
  })

  // Mock console methods to reduce test noise
  global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    // Keep error and warn for debugging
  }

  // Enhanced fetch mock for API tests
  const mockResponse: Response = {
    ok: true,
    status: 200,
    statusText: 'OK',
    redirected: false,
    type: 'basic',
    url: 'http://localhost:3000',
    headers: new Headers(),
    body: null,
    bodyUsed: false,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    bytes: () => Promise.resolve(new Uint8Array()),
    clone: () => mockResponse,
  } as Response

  const mockFetch = vi.fn().mockImplementation(() => Promise.resolve(mockResponse))
  // Add preconnect property to match Bun's fetch type
  Object.assign(mockFetch, {
    preconnect: vi.fn(),
  })
  global.fetch = mockFetch as unknown as typeof fetch

  // Mock getComputedStyle with complete CSS variable support
  window.getComputedStyle = createMockGetComputedStyle() as any

  // Mock URL for any routing tests
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
  })

  // Mock requestAnimationFrame for animation components
  global.requestAnimationFrame = vi.fn(cb => {
    setTimeout(cb, 16) // ~60fps
    return 1
  })
  global.cancelAnimationFrame = vi.fn()

  // Mock performance API for timing measurements
  Object.defineProperty(window, 'performance', {
    value: {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => []),
    },
  })
})

afterAll(() => {
  // Clean up mocks if needed
  vi.clearAllMocks()
})
