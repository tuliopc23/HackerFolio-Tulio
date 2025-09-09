import { hydrateRoot, createRoot } from 'react-dom/client'

import App from './App'
// No change here: App creates a router with browser history by default
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

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
