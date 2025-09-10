import { hydrateRoot, createRoot } from 'react-dom/client'

import monaspaceNeonUrl from '@/assets/Monaspace Neon/Monaspace Neon Var.woff2?url'

import App from './App'
import './index.css'

const rootElement = document.getElementById('root')

if (!import.meta.env.DEV && typeof document !== 'undefined' && monaspaceNeonUrl) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'font'
  link.href = monaspaceNeonUrl
  link.type = 'font/woff2'
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}
if (!rootElement) {
  throw new Error('Root element not found')
}

function renderApp() {
  if (!rootElement) return

  try {
    if (import.meta.env.DEV) {
      createRoot(rootElement).render(<App />)
    } else {
      const hasSSRContent = rootElement.firstElementChild != null
      if (hasSSRContent) {
        hydrateRoot(rootElement, <App />)
      } else {
        createRoot(rootElement).render(<App />)
      }
    }
  } catch {
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
