import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Flow-Reader/',
  plugins: [
    react(),
    // VitePWA removed from production builds to avoid service worker
    // interference while diagnosing and fixing deployment issues.
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
