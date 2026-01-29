import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Flow-Reader/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.svg'],
      manifest: {
        name: 'Flow RSVP',
        short_name: 'Flow',
        description: 'A mindful speed-reading sanctuary — Flow RSVP',
        start_url: '/Flow-Reader/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#F4F4F1',
        background_color: '#F4F4F1',
        icons: [
          { src: '/Flow-Reader/icons/flowy-icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: '/Flow-Reader/icons/flowy-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/assets\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'asset-cache' }
          },
          {
            urlPattern: /^https:\/\/gutendex\.com\//,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\/icons\//,
            handler: 'CacheFirst',
            options: { cacheName: 'icon-cache' }
          }
        ]
      }
    })
  ],
  build: {
    // raise warning limit slightly but **isolate** heavy libs into separate chunks
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-zip': ['jszip'],
          'vendor-framer': ['framer-motion']
        }
      }
    }
  },
  worker: {
    // ensure workers are emitted as ES modules (avoids IIFE/UMD conflicts with code-splitting)
    format: 'es'
  },
  server: {
    port: 5173
  }
})
