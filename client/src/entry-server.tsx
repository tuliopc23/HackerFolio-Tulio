import React from 'react'
import { renderToString } from 'react-dom/server'
import { createMemoryHistory } from '@tanstack/react-router'
import { AppRouterProvider, createAppRouter } from './router'
import { fetchProjects, fetchContent } from './lib/api'

export async function render(url: string) {
  const history = createMemoryHistory({ initialEntries: [url] })
  const router = createAppRouter({ history })
  return renderToString(React.createElement(AppRouterProvider, { router }))
}

export async function renderWithData(url: string): Promise<{ html: string; data: Record<string, any> }>{
  // Prefetch simple page data based on the path to avoid client refetch
  const u = new URL(url, 'http://localhost')
  const path = u.pathname
  const data: Record<string, any> = {}
  try {
    if (path === '/projects') {
      data.projects = await fetchProjects()
    } else if (path === '/about') {
      data.about = (await fetchContent('about')).content
    } else if (path === '/contact') {
      data.contact = (await fetchContent('contact')).content
    } else if (path === '/resume') {
      try {
        data.resume = (await fetchContent('resume')).content
      } catch {
        // ignore if resume not present
      }
    }
  } catch (e) {
    // Non-fatal; proceed with empty data for CSR fetch
  }

  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createAppRouter({ history })
  const html = renderToString(React.createElement(AppRouterProvider, { router }))
  return { html, data }
}
