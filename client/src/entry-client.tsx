import { hydrateRoot } from 'react-dom/client'

import App from './App'
// No change here: App creates a router with browser history by default
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

hydrateRoot(rootElement, <App />)
