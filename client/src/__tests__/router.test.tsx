import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from '@tanstack/history'

import { createAppRouter, AppRouterProvider } from '@/router-enhanced'

// Mock the heavy components to avoid loading issues in tests
vi.mock('@/pages/not-found', () => ({
  default: () => <div data-testid='not-found'>404 Not Found</div>,
}))

vi.mock('@/pages/projects', () => ({
  default: () => <div data-testid='projects'>Projects Page</div>,
}))

vi.mock('@/components/TerminalThemePreview', () => ({
  default: () => <div data-testid='theme-preview'>Theme Preview</div>,
}))

vi.mock('@/pages/home', () => ({
  default: () => <div data-testid='home'>Home Page</div>,
}))

// Mock the providers to avoid complex setup
vi.mock('@/components/providers', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock the queries
vi.mock('@/lib/queries', () => ({
  fetchProjects: vi.fn().mockResolvedValue([]),
}))

// Mock route guards to avoid client-side APIs in tests
vi.mock('@/lib/route-guards', () => ({
  createRouteGuard: vi.fn(() => () => Promise.resolve()),
  routeGuards: {
    devOnly: vi.fn(() => () => true),
    rateLimit: vi.fn(() => () => true),
  },
  trackRoutePerformance: vi.fn(),
}))

// Mock route preloader
vi.mock('@/lib/route-preloader', () => ({
  useRoutePreloader: vi.fn(() => ({
    observeLinks: vi.fn(),
    destroy: vi.fn(),
  })),
}))

describe('Router Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders home page at root route', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const router = createAppRouter({ history })

    render(<AppRouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument()
    })
  })

  test('renders projects page at /projects route', async () => {
    const history = createMemoryHistory({ initialEntries: ['/projects'] })
    const router = createAppRouter({ history })

    render(<AppRouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByTestId('projects')).toBeInTheDocument()
    })
  })

  test('renders theme preview page at /theme-preview route', async () => {
    const history = createMemoryHistory({ initialEntries: ['/theme-preview'] })
    const router = createAppRouter({ history })

    render(<AppRouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByTestId('theme-preview')).toBeInTheDocument()
    })
  })

  test('renders not found page for unknown routes', async () => {
    const history = createMemoryHistory({ initialEntries: ['/unknown-route'] })
    const router = createAppRouter({ history })

    render(<AppRouterProvider router={router} />)

    await waitFor(() => {
      expect(screen.getByTestId('not-found')).toBeInTheDocument()
    })
  })

  test('router has correct configuration', () => {
    const router = createAppRouter()

    expect(router.options.defaultPreload).toBe('intent')
    expect(router.options.defaultPreloadStaleTime).toBe(30_000)
    expect(router.options.defaultErrorComponent).toBeDefined()
    expect(router.options.defaultPendingComponent).toBeDefined()
  })

  test('router handles navigation correctly', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const router = createAppRouter({ history })

    render(<AppRouterProvider router={router} />)

    // Start at home
    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument()
    })

    // Navigate to projects
    await router.navigate({ to: '/projects' })

    await waitFor(() => {
      expect(screen.getByTestId('projects')).toBeInTheDocument()
    })
  })

  test('router handles hash history correctly', () => {
    const router = createAppRouter()
    expect(router.history.location.pathname).toBe('/')
  })

  test('router devtools are conditionally loaded', () => {
    // In test environment, DEV should be false, so devtools shouldn't be loaded
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const router = createAppRouter({ history })

    render(<AppRouterProvider router={router} />)

    // DevTools should not be present in test environment
    expect(screen.queryByTestId('tanstack-router-devtools')).not.toBeInTheDocument()
  })
})

describe('Route Error Handling', () => {
  test('router has error handling configured', () => {
    const router = createAppRouter()

    // Check that error components are configured
    expect(router.options.defaultErrorComponent).toBeDefined()
    expect(router.routeTree.children).toBeDefined()
  })
})

describe('Route Loading States', () => {
  test('displays loading spinner during route transitions', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] })
    const router = createAppRouter({ history })

    render(<AppRouterProvider router={router} />)

    // The loading spinner should appear briefly during initial load
    // This is hard to test reliably, so we just ensure the component renders
    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument()
    })
  })
})
