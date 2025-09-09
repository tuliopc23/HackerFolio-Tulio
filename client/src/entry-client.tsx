import { hydrateRoot, createRoot } from 'react-dom/client'

import App from './App'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Enhanced hydration with better error handling
function renderApp() {
  if (!rootElement) {
    // eslint-disable-next-line no-console
    console.error('Root element not found')
    return
  }

  try {
    // In development (Vite), there is no SSR markup. Force client mount.
    if (import.meta.env.DEV) {
      createRoot(rootElement).render(<App />)
    } else {
      // In production, hydrate only if SSR injected DOM exists.
      const hasSSRContent = rootElement.firstElementChild != null
      if (hasSSRContent) {
        hydrateRoot(rootElement, <App />)
      } else {
        createRoot(rootElement).render(<App />)
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to render app:', error)
    // Fallback to basic error display
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px;">
        <div style="color: #ef4444; font-size: 20px; margin-bottom: 16px;">⚠️ App Error</div>
        <p style="color: #6b7280; margin-bottom: 16px; text-align: center; max-width: 400px;">
          Something went wrong while starting the application. Please refresh the page.
        </p>
        <button onclick="window.location.reload()" style="padding: 8px 16px; background: #06b6d4; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `
  }
}

renderApp()
