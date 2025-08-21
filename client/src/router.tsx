import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router'
import React from 'react'

import { ThemeProvider } from '@/components/terminal/theme-context'
import { fetchProjects, fetchContent } from '@/lib/api'
import About from '@/pages/about'
import Contact from '@/pages/contact'
import Home from '@/pages/home'
import NotFound from '@/pages/not-found'
import Projects from '@/pages/projects'
import Resume from '@/pages/resume'

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
    if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__?.projects) {
      const { projects } = (window as any).__INITIAL_DATA__
      delete (window as any).__INITIAL_DATA__.projects
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
    if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__?.about) {
      const content = (window as any).__INITIAL_DATA__.about
      delete (window as any).__INITIAL_DATA__.about
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
    if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__?.contact) {
      const content = (window as any).__INITIAL_DATA__.contact
      delete (window as any).__INITIAL_DATA__.contact
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
    if (typeof window !== 'undefined' && (window as any).__INITIAL_DATA__?.resume) {
      const content = (window as any).__INITIAL_DATA__.resume
      delete (window as any).__INITIAL_DATA__.resume
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
  notFoundRoute,
])

export function createAppRouter(opts?: { history?: any }) {
  return createRouter({
    routeTree,
    history: opts?.history,
  })
}

export function AppRouterProvider({ router }: { router: ReturnType<typeof createAppRouter> }) {
  return <RouterProvider router={router} />
}
