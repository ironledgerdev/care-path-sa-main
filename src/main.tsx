import { createRoot } from 'react-dom/client'
import './utils/patchResizeObserver';
import './utils/suppressResizeObserverError';
import './integrations/sentry';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
