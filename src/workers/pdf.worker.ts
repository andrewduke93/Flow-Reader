/* eslint-disable no-restricted-globals */
// PDF worker: imports pdfjs-dist inside the worker to keep heavy runtime out of the main chunk.
// Receives: { id, arrayBuffer }
// Posts: { id, success: true, text, thumbnail } | { id, success: false, error }

import { tokenizeText } from '../utils/tokenize'

self.addEventListener('message', async (ev: MessageEvent) => {
  const { id, arrayBuffer, maxTokens } = ev.data as { id: string; arrayBuffer: ArrayBuffer; maxTokens?: number }
  try {
    // dynamic import inside worker
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf') as any
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const pageCount = pdf.numPages
    let fullText = ''
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((it: any) => it.str).join(' ')
      fullText += '\n\n' + pageText
      if (fullText.length > 20000) break
      // yield
      await new Promise(res => setTimeout(res, 0))
    }

    // thumbnail rendering is only reliable in browser contexts with Canvas — workers may not have DOM canvas
    let thumbnail: string | null = null
    try {
      if ((self as any).OffscreenCanvas) {
        const first = await pdf.getPage(1)
        const viewport = first.getViewport({ scale: 1.0 })
        const canvas = new OffscreenCanvas(Math.round(viewport.width), Math.round(viewport.height))
        const ctx = canvas.getContext('2d')!
        await first.render({ canvasContext: ctx, viewport }).promise
        const blob = await canvas.convertToBlob({ type: 'image/png' })
        const ab = await blob.arrayBuffer()
        const binary = Array.from(new Uint8Array(ab)).map((b) => String.fromCharCode(b)).join('')
        thumbnail = `data:image/png;base64,${btoa(binary)}`
      }
    } catch (err) {
      thumbnail = null
    }

    const tokens = tokenizeText(fullText || '', maxTokens ?? Infinity)
    ;(self as any).postMessage({ id, success: true, text: fullText, tokens, thumbnail })
  } catch (err: any) {
    ;(self as any).postMessage({ id, success: false, error: String(err?.message ?? err) })
  }
})
