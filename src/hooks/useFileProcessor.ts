import { useCallback, useState } from 'react'
import { stripEpub } from '../utils/epubStripper'
import { stripPdf } from '../utils/pdfStripper'
import { tokenizeText } from '../utils/tokenize'
import type { Token } from '../types/token'

export type ProcessResult = {
  text: string
  tokens: Token[]
  thumbnail?: string | null
  metadata?: { title?: string; author?: string }
}

export default function useFileProcessor(){
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle'|'processing'|'done'|'error'>('idle')

  const processFile = useCallback(async (file: File, opts?: { maxTokens?: number, onProgress?: (n: number) => void }): Promise<ProcessResult> => {
    setStatus('processing')
    setProgress(0)
    const maxTokens = opts?.maxTokens ?? Infinity
    try {
      const type = file.type || ''
      if (type.includes('epub') || file.name.toLowerCase().endsWith('.epub')) {
        const ab = await file.arrayBuffer()
        const res = await stripEpub(ab, maxTokens)
        setProgress(100)
        opts?.onProgress?.(100)
        setStatus('done')
        return { text: res.text, tokens: res.tokens, thumbnail: res.coverDataUrl, metadata: { title: file.name } }
      }

      if (type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
        const ab = await file.arrayBuffer()
        const res = await stripPdf(ab, maxTokens, (p) => { setProgress(p); opts?.onProgress?.(p) })
        setProgress(100)
        setStatus('done')
        return { text: res.text, tokens: res.tokens, thumbnail: res.thumbnail, metadata: { title: file.name } }
      }

      // fallback for plain text
      if (type.startsWith('text') || file.name.toLowerCase().endsWith('.txt')) {
        const txt = await file.text()
        const tokens = tokenizeText(txt, maxTokens)
        setProgress(100)
        setStatus('done')
        return { text: txt, tokens, metadata: { title: file.name } }
      }

      // unknown type: attempt plain text
      const txt = await file.text().catch(() => '')
      const tokens = tokenizeText(txt, maxTokens)
      setProgress(100)
      setStatus('done')
      return { text: txt, tokens, metadata: { title: file.name } }
    } catch (err) {
      setStatus('error')
      setProgress(0)
      throw err
    }
  }, [])

  return { processFile, progress, status }
}
