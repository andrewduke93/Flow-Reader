import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
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

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
