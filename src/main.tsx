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
