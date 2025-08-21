import { hydrateRoot } from 'react-dom/client';
import App from './App';
// No change here: App creates a router with browser history by default
import './index.css';

hydrateRoot(document.getElementById('root')!, <App />);
