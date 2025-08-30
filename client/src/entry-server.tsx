import { createMemoryHistory } from '@tanstack/history'
import { renderToString } from 'react-dom/server'

import { createAppRouter, AppRouterProvider } from './router-enhanced'

export function render(url: string): string {
  const history = createMemoryHistory({ initialEntries: [url] })
  const router = createAppRouter({ history })

  return renderToString(<AppRouterProvider router={router} />)
}

export function renderWithData(url: string, data?: Record<string, unknown>) {
  const history = createMemoryHistory({ initialEntries: [url] })
  const router = createAppRouter({ history })

  const html = renderToString(<AppRouterProvider router={router} />)
  return { html, data: data ?? {} }
}
