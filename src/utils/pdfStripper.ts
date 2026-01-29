import { tokenizeText } from './tokenize'

// pdfjs-dist is large; import dynamically so TypeScript doesn't require types at top-level
// and so bundlers can code-split it.
// Minimal PDF text extraction using pdfjs-dist. Returns concatenated text, tokens, and a thumbnail (dataURL) for the first page.
export async function stripPdf(arrayBuffer: ArrayBuffer, maxTokens = Infinity, onProgress?: (p: number) => void) {
  // Prefer workerized parsing so pdfjs-dist runs off-main-thread and is isolated into its own chunk.
  if (typeof Worker !== 'undefined') {
    try {
      const worker = new Worker(new URL('../workers/pdf.worker?worker', import.meta.url), { type: 'module' })
      const id = String(Math.random()).slice(2)
      const p = new Promise<any>((resolve, reject) => {
        const onMsg = (ev: MessageEvent) => {
          const data = ev.data
          if (data?.id !== id) return
          worker.removeEventListener('message', onMsg)
          if (data.success) resolve({ text: data.text, tokens: data.tokens, thumbnail: data.thumbnail })
          else reject(new Error(data.error || 'pdf-worker-error'))
        }
        worker.addEventListener('message', onMsg)
        worker.postMessage({ id, arrayBuffer, maxTokens }, [arrayBuffer])
        // timeout fallback
        const to = window.setTimeout(() => {
          worker.terminate()
          reject(new Error('pdf-worker-timeout'))
        }, 30_000)
        p.finally(() => clearTimeout(to))
      })
      const result = await p
      try { worker.terminate() } catch (err) {}
      return result
    } catch (err) {
      // fall through to main-thread parser
      console.warn('pdf worker failed, falling back to main-thread parser', err)
    }
  }

  // Fallback: dynamic import on main thread (keeps dev and SSR stable)
  // dynamic import to keep initial bundle small
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    if (onProgress) onProgress(Math.round((i / pageCount) * 100))
    if (fullText.length > 20000) break
    // yield to the event loop so UI can breathe
    await new Promise(res => setTimeout(res, 0))
  }

  // render first page to canvas for thumbnail (browser only)
  let thumbnail: string | null = null
  try {
    const first = await pdf.getPage(1)
    const viewport = first.getViewport({ scale: 1.0 })
    // use DOM canvas when available (more compatible)
    let canvas: HTMLCanvasElement | OffscreenCanvas
    if (typeof document !== 'undefined') {
      canvas = document.createElement('canvas')
      canvas.width = Math.round(viewport.width)
      canvas.height = Math.round(viewport.height)
      const ctx = (canvas as HTMLCanvasElement).getContext('2d')!
      await first.render({ canvasContext: ctx, viewport }).promise
      thumbnail = (canvas as HTMLCanvasElement).toDataURL('image/png')
    } else if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(Math.round(viewport.width), Math.round(viewport.height))
      const ctx = (canvas as OffscreenCanvas).getContext('2d')!
      await first.render({ canvasContext: ctx, viewport }).promise
      const blob = await (canvas as OffscreenCanvas).convertToBlob({ type: 'image/png' })
      const ab = await blob.arrayBuffer()
      // browser environment fallbacks handled above; if running headless this may not be used
      const binary = Array.from(new Uint8Array(ab)).map((b) => String.fromCharCode(b)).join('')
      thumbnail = `data:image/png;base64,${btoa(binary)}`
    }
  } catch (err) {
    thumbnail = null
  }

  const tokens = tokenizeText(fullText || '', maxTokens)
  return { text: fullText, tokens, thumbnail }
}
