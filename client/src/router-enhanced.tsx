import { createHashHistory } from '@tanstack/history'
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  type RouterHistory,
} from '@tanstack/react-router'
import React, { lazy } from 'react'

import { AppProviders } from '@/components/providers'
import { fetchProjects } from '@/lib/queries'
import Home from '@/pages/home'

// Lazy load heavy components to reduce initial bundle size
const NotFound = lazy(() => import('@/pages/not-found'))
const Projects = lazy(() => import('@/pages/projects'))
const TerminalThemePreview = lazy(() => import('@/components/TerminalThemePreview'))

const rootRoute = createRootRoute({
  component: () => (
    <AppProviders>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </React.Suspense>
    </AppProviders>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
})

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  loader: async () => {
    if (
      typeof window !== 'undefined' &&
      (window as Window & { __INITIAL_DATA__?: Record<string, unknown> }).__INITIAL_DATA__?.projects
    ) {
      const initialData = (window as Window & { __INITIAL_DATA__?: Record<string, unknown> })
        .__INITIAL_DATA__
      if (!initialData) return { projects: [] }
      const { projects } = initialData
      delete initialData.projects
      return { projects }
    }
    const projects = await fetchProjects()
    return { projects }
  },
  component: Projects,
})

// Removed orphan routes: about, contact, resume

// Theme preview route for testing ANSI colors
const themePreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/theme-preview',
  component: TerminalThemePreview,
})

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  projectsRoute,
  themePreviewRoute,
  notFoundRoute,
])

interface RouterOpts {
  history?: RouterHistory
}

export function createAppRouter(opts?: RouterOpts) {
  const history: RouterHistory = opts?.history ?? createHashHistory()

  return createRouter({
    routeTree,
    history,
  })
}

export function AppRouterProvider({ router }: { router: ReturnType<typeof createAppRouter> }) {
  return <RouterProvider router={router} />
}
