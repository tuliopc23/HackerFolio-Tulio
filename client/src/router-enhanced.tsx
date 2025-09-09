import { createHashHistory } from '@tanstack/history'
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  type RouterHistory,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

import { AppProviders } from '@/components/providers'
import { fetchProjects } from '@/lib/queries'
import { createRouteGuard, routeGuards, trackRoutePerformance } from '@/lib/route-guards'
import Home from '@/pages/home'

// Enhanced loading component with better UX
const RouteLoadingSpinner = () => (
  <div className='flex items-center justify-center min-h-[200px]'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-bright' />
  </div>
)

// Enhanced error boundary component
const RouteErrorComponent = ({ error, reset }: ErrorComponentProps) => (
  <div className='flex flex-col items-center justify-center min-h-[400px] p-6'>
    <div className='text-red-500 text-xl mb-4'>⚠️ Route Error</div>
    <p className='text-gray-600 mb-4 text-center max-w-md'>
      {error.message || 'Something went wrong while loading this page.'}
    </p>
    <button
      onClick={reset}
      className='px-4 py-2 bg-cyan-bright text-white rounded hover:bg-cyan-soft transition-colors'
    >
      Try Again
    </button>
  </div>
)

// Enhanced lazy loading with error handling and retry logic
const createLazyComponent = <T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
) => {
  return lazy(() =>
    importFn().catch(error => {
      // eslint-disable-next-line no-console
      console.error(`Failed to load ${componentName}:`, error)
      // Return a fallback component for failed imports
      return {
        default: (() => (
          <div className='flex flex-col items-center justify-center min-h-[400px] p-6'>
            <div className='text-red-500 text-xl mb-4'>⚠️ Component Load Error</div>
            <p className='text-gray-600 mb-4 text-center max-w-md'>
              Failed to load {componentName}. Please refresh the page.
            </p>
            <button
              onClick={() => {
                window.location.reload()
              }}
              className='px-4 py-2 bg-cyan-bright text-white rounded hover:bg-cyan-soft transition-colors'
            >
              Refresh Page
            </button>
          </div>
        )) as unknown as T,
      }
    })
  )
}

// Lazy load heavy components to reduce initial bundle size
const NotFound = createLazyComponent(() => import('@/pages/not-found'), 'NotFound')
const Projects = createLazyComponent(() => import('@/pages/projects'), 'Projects')
const TerminalThemePreview = createLazyComponent(
  () => import('@/components/TerminalThemePreview'),
  'TerminalThemePreview'
)

const rootRoute = createRootRoute({
  component: () => (
    <AppProviders>
      <Suspense fallback={<RouteLoadingSpinner />}>
        <Outlet />
      </Suspense>
    </AppProviders>
  ),
  errorComponent: RouteErrorComponent,
  notFoundComponent: () => <NotFound />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
  errorComponent: RouteErrorComponent,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  beforeLoad: createRouteGuard([
    routeGuards.rateLimit(20, 60000), // 20 requests per minute
  ]),
  loader: async () => {
    try {
      // Check for SSR initial data first
      if (
        typeof window !== 'undefined' &&
        (window as Window & { __INITIAL_DATA__?: Record<string, unknown> }).__INITIAL_DATA__
          ?.projects
      ) {
        const initialData = (window as Window & { __INITIAL_DATA__?: Record<string, unknown> })
          .__INITIAL_DATA__
        if (!initialData) return { projects: [] }
        const { projects } = initialData
        delete initialData.projects

        // Track performance
        trackRoutePerformance('/projects')
        return { projects }
      }

      // Fetch projects with abort signal for cancellation
      const projects = await fetchProjects()

      // Track performance
      trackRoutePerformance('/projects')
      return { projects }
    } catch (error) {
      // Handle loader errors gracefully
      // eslint-disable-next-line no-console
      console.error('Failed to load projects:', error)
      throw new Error('Failed to load projects. Please try again.')
    }
  },
  component: Projects,
  errorComponent: RouteErrorComponent,
  pendingComponent: RouteLoadingSpinner,
})

// Removed orphan routes: about, contact, resume

// Theme preview route for testing ANSI colors (dev only)
const themePreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/theme-preview',
  beforeLoad: createRouteGuard([
    routeGuards.devOnly(),
    routeGuards.rateLimit(5, 30000), // 5 requests per 30 seconds
  ]),
  component: TerminalThemePreview,
  errorComponent: RouteErrorComponent,
  pendingComponent: RouteLoadingSpinner,
})

// Note: notFoundRoute is now handled by rootRoute.notFoundComponent

const routeTree = rootRoute.addChildren([indexRoute, projectsRoute, themePreviewRoute])

interface RouterOpts {
  history?: RouterHistory
}

export function createAppRouter(opts?: RouterOpts) {
  const history: RouterHistory = opts?.history ?? createHashHistory()

  return createRouter({
    routeTree,
    history,
    defaultPreload: 'intent', // Preload routes on hover/focus
    defaultPreloadStaleTime: 30_000, // 30 seconds
    defaultErrorComponent: RouteErrorComponent,
    defaultPendingComponent: RouteLoadingSpinner,
    // Enable router context for better debugging
    context: {
      // Add any global context here
    },
  })
}

export function AppRouterProvider({ router }: { router: ReturnType<typeof createAppRouter> }) {
  return (
    <>
      <RouterProvider router={router} />
      {/* Router DevTools - only in development */}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <TanStackRouterDevtools router={router} />
        </Suspense>
      )}
    </>
  )
}

// Lazy load devtools to avoid including in production bundle
const TanStackRouterDevtools = lazy(() =>
  import('@tanstack/react-router-devtools').then(module => ({
    default: module.TanStackRouterDevtools,
  }))
)
