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

import { ThemeProvider } from '@/components/terminal/theme-context'
import { fetchProjects, fetchContent } from '@/lib/api'
import Home from '@/pages/home'

// Lazy load heavy components to reduce initial bundle size
const About = lazy(() => import('@/pages/about'))
const Contact = lazy(() => import('@/pages/contact'))
const NotFound = lazy(() => import('@/pages/not-found'))
const Projects = lazy(() => import('@/pages/projects'))
const Resume = lazy(() => import('@/pages/resume'))
const TerminalThemePreview = lazy(() => import('@/components/TerminalThemePreview'))

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <div className='crt-screen'>
        <Outlet />
      </div>
    </ThemeProvider>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
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

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  loader: async () => {
    if (
      typeof window !== 'undefined' &&
      (window as Window & { __INITIAL_DATA__?: Record<string, unknown> }).__INITIAL_DATA__?.about
    ) {
      const initialData = (window as Window & { __INITIAL_DATA__?: Record<string, unknown> })
        .__INITIAL_DATA__
      if (!initialData) return null
      const content = initialData.about
      delete initialData.about
      return { content }
    }
    const { content } = await fetchContent('about')
    return { content }
  },
  component: About,
})

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  loader: async () => {
    if (
      typeof window !== 'undefined' &&
      (window as Window & { __INITIAL_DATA__?: Record<string, unknown> }).__INITIAL_DATA__?.contact
    ) {
      const initialData = (window as Window & { __INITIAL_DATA__?: Record<string, unknown> })
        .__INITIAL_DATA__
      if (!initialData) return null
      const content = initialData.contact
      delete initialData.contact
      return { content }
    }
    const { content } = await fetchContent('contact')
    return { content }
  },
  component: Contact,
})

const resumeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resume',
  loader: async () => {
    // Optional SSR fetch; falls back to local content
    if (
      typeof window !== 'undefined' &&
      (window as Window & { __INITIAL_DATA__?: Record<string, unknown> }).__INITIAL_DATA__?.resume
    ) {
      const initialData = (window as Window & { __INITIAL_DATA__?: Record<string, unknown> })
        .__INITIAL_DATA__
      if (!initialData) return null
      const content = initialData.resume
      delete initialData.resume
      return { content }
    }
    try {
      const { content } = await fetchContent('resume')
      return { content }
    } catch {
      return { content: null }
    }
  },
  component: Resume,
})

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
  aboutRoute,
  contactRoute,
  resumeRoute,
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
