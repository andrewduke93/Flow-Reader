import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { SettingsProvider } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <SettingsProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </SettingsProvider>
  </React.StrictMode>
);

// Signal that the app has been mounted and remove the splash fallback.
setTimeout(() => {
  try {
    (window as any).__FLOW_APP_READY = true;
    const s = document.getElementById('splash-fallback');
    if (s && s.parentNode) s.parentNode.removeChild(s);
  } catch (e) {}
}, 50);

declare global {
  interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_MODE: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

document.getElementById('__flow_reload')?.addEventListener('click', () => location.reload());
