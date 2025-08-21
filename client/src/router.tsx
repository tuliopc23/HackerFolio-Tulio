import React from 'react'
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  Link,
} from '@tanstack/react-router'
import Home from '@/pages/home'
import Projects from '@/pages/projects'
import About from '@/pages/about'
import Contact from '@/pages/contact'
import Resume from '@/pages/resume'
import NotFound from '@/pages/not-found'
import { ThemeProvider } from '@/components/terminal/theme-context'
import { fetchProjects, fetchContent } from '@/lib/api'

export const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <div className="crt-screen">
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
      const projects = (window as any).__INITIAL_DATA__.projects
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

export const routeTree = rootRoute.addChildren([
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
