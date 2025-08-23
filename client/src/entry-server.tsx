import { createMemoryHistory } from '@tanstack/history'
import { renderToString } from 'react-dom/server'

import { createAppRouter, AppRouterProvider } from './router'

export function render(url: string) {
  const history = createMemoryHistory({ initialEntries: [url] })
  const router = createAppRouter({ history })

  const html = renderToString(<AppRouterProvider router={router} />)
  return { html }
}

export function renderWithData(url: string, data?: Record<string, unknown>) {
  const history = createMemoryHistory({ initialEntries: [url] })
  const router = createAppRouter({ history })

  const html = renderToString(<AppRouterProvider router={router} />)
  return { html, data: data ?? {} }
}
