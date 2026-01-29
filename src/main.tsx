import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

// register vite-pwa service worker (auto-update)
import { registerSW } from 'virtual:pwa-register'
const updateSW = registerSW({ onNeedRefresh() {}, onOfflineReady() {} })

// handle sync-link params (book/id position sharing)
try {
  const qs = new URLSearchParams(location.search)
  const book = qs.get('book')
  const i = qs.get('i')
  if (book && i) {
    window.addEventListener('load', () => {
      try { window.dispatchEvent(new CustomEvent('flow:open', { detail: { bookId: book, index: Number(i) } })) } catch (err) {}
    })
  }
} catch (err) {}

const MOUNT_NODE = document.getElementById('root')!;
const root = createRoot(MOUNT_NODE);

// Surface fatal runtime errors early and capture a short diagnostic for the user/CI.
function writeDiagnostic(err: {message?: string;stack?: string} | string) {
  try {
    const payload = {
      time: Date.now(),
      env: {mode: import.meta.env.MODE, base: import.meta.env.BASE_URL},
      error: typeof err === 'string' ? {message: err} : {message: err.message, stack: err.stack},
    } as const;
    localStorage.setItem('flow:diagnostic', JSON.stringify(payload));
    // keep a non-persisted in-memory copy for quick access from DevTools
    ;(window as any).__FLOW_LAST_ERROR = payload;
    return payload;
  } catch {
    return null;
  }
}

function renderFatalBanner(message: string) {
  try {
    MOUNT_NODE.innerHTML = '';
    const el = document.createElement('div');
    el.id = '__flow_fatal';
    el.style.cssText = 'position:fixed;inset:16px;margin:0;padding:20px;border-radius:12px;background:linear-gradient(180deg,#fff7f6,#fff);color:#1a1a1a;box-shadow:0 10px 30px rgba(10,10,10,0.12);z-index:99999;font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;max-width:820px;left:50%;transform:translateX(-50%);';
    el.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center;">
        <div style="width:44px;height:44px;border-radius:10px;background:#ffebe6;display:flex;align-items:center;justify-content:center;font-size:20px">⚠️</div>
        <div style="flex:1">
          <div style="font-weight:600;margin-bottom:6px">Application error — UI failed to initialize</div>
          <div style="font-size:13px;color:#333;line-height:1.3;max-height:6.6em;overflow:auto">${String(message).replace(/</g,'&lt;')}</div>
          <div style="margin-top:10px;font-size:13px;color:#666">Open DevTools → Console and paste the diagnostic (copied to clipboard).</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-left:12px">
          <button id="__flow_copy_diag" style="background:#ff5c00;color:white;border:none;padding:8px 12px;border-radius:8px;cursor:pointer">Copy diagnostic</button>
          <button id="__flow_reload" style="background:transparent;border:1px solid #ddd;padding:6px 10px;border-radius:8px;cursor:pointer">Hard reload</button>
        </div>
      </div>
    `;
    MOUNT_NODE.appendChild(el);
    const diag = localStorage.getItem('flow:diagnostic') || '';
    const copyBtn = document.getElementById('__flow_copy_diag');
    copyBtn?.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(diag); copyBtn.textContent = 'Copied'; } catch { copyBtn.textContent = 'Copy failed'; }
    });
    document.getElementById('__flow_reload')?.addEventListener('click', () => location.reload(true));
  } catch (e) {
    // best-effort only
    try { MOUNT_NODE.textContent = 'Application failed to start — open DevTools for details.'; } catch {}
  }
}

// Global handlers to catch errors that prevent React from mounting
window.addEventListener('error', (ev) => {
  try {
    const payload = writeDiagnostic(ev.error || ev.message || String(ev));
    console.error('[FLOW][fatal]', payload);
  } catch {}
});
window.addEventListener('unhandledrejection', (ev) => {
  try {
    const reason = (ev && (ev as any).reason) || ev;
    const payload = writeDiagnostic(reason instanceof Error ? { message: reason.message, stack: reason.stack } : String(reason));
    console.error('[FLOW][fatal][unhandledrejection]', payload);
  } catch {}
});

try {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );

  // App mounted successfully — remove the splash fallback that is preserved
  // by index.html. Keep this here rather than relying on the 'load' event so
  // we don't show a white screen if the bundle never initializes.
  try {
    const s = document.getElementById('splash-fallback');
    if (s && (window as any).__FLOW_PRESERVE_SPLASH) {
      s.remove();
      console.info('[FLOW] removed splash fallback after successful mount');
    }
  } catch (e) {
    /* best-effort */
  }
} catch (err: any) {
  console.error('[FLOW][render-fatal]', err);
  writeDiagnostic(err);
  renderFatalBanner(err && (err.message || String(err)) || 'Unknown error');
}
