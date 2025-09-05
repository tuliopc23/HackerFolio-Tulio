import { createMemoryHistory } from '@tanstack/history'
import { renderToString } from 'react-dom/server'

import { createAppRouter, AppRouterProvider } from './router-enhanced'

export async function render(url: string): Promise<string> {
  try {
    const history = createMemoryHistory({ initialEntries: [url] })
    const router = createAppRouter({ history })

    // Wait for router to be ready
    await router.load()

    const html = renderToString(<AppRouterProvider router={router} />)
    return html
  } catch (error) {
    console.error('[SSR] Render error:', error)
    return '<div>SSR Error</div>'
  }
}

export function renderWithData(url: string, data?: Record<string, unknown>) {
  const history = createMemoryHistory({ initialEntries: [url] })
  const router = createAppRouter({ history })

  const html = renderToString(<AppRouterProvider router={router} />)
  return { html, data: data ?? {} }
}
