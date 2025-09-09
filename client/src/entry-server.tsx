import { createMemoryHistory } from '@tanstack/history'
import { renderToString } from 'react-dom/server'

import App from './App'
import { createAppRouter } from './router-enhanced'

export async function render(url: string): Promise<string> {
  try {
    const history = createMemoryHistory({ initialEntries: [url] })
    const router = createAppRouter({ history })

    // Wait for router to be ready and all loaders to complete
    await router.load()

    const html = renderToString(<App router={router} />)
    return html
  } catch (error) {
    console.error('[SSR] Render error:', error)
    // Return a more user-friendly error page
    return renderToString(
      <div className='flex flex-col items-center justify-center min-h-screen p-6'>
        <div className='text-red-500 text-xl mb-4'>⚠️ Server Error</div>
        <p className='text-gray-600 mb-4 text-center max-w-md'>
          Something went wrong on the server. Please try refreshing the page.
        </p>
      </div>
    )
  }
}

export async function renderWithData(url: string, initialData?: Record<string, unknown>) {
  try {
    const history = createMemoryHistory({ initialEntries: [url] })
    const router = createAppRouter({ history })

    // Inject initial data into window for hydration
    if (initialData && typeof window !== 'undefined') {
      ;(window as Window & { __INITIAL_DATA__?: Record<string, unknown> }).__INITIAL_DATA__ =
        initialData
    }

    // Wait for router to be ready
    await router.load()

    const html = renderToString(<App router={router} />)
    return { html, data: initialData ?? {} }
  } catch (error) {
    console.error('[SSR] RenderWithData error:', error)
    const fallbackHtml = renderToString(
      <div className='flex flex-col items-center justify-center min-h-screen p-6'>
        <div className='text-red-500 text-xl mb-4'>⚠️ Server Error</div>
        <p className='text-gray-600 mb-4 text-center max-w-md'>
          Something went wrong on the server. Please try refreshing the page.
        </p>
      </div>
    )
    return { html: fallbackHtml, data: {} }
  }
}
