import { useCallback, useEffect, useRef, useState } from 'react'
import { db, BookRecord } from '../utils/db'

type IngestTask = { id: string; status: 'pending' | 'done' | 'error'; progress?: number }

export default function useLibrary(){
  const [books, setBooks] = useState<BookRecord[]>([])
  const [recent, setRecent] = useState<BookRecord[]>([])
  const [loading, setLoading] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const tasks = useRef<Map<string, IngestTask>>(new Map())

  useEffect(() => {
    let mounted = true
    setLoading(true)
    db.books.orderBy('addedAt').reverse().toArray().then(all => {
      if (!mounted) return
      setBooks(all)
      setRecent(all.slice(0, 3))
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  // initialize worker lazily
  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      // Vite-friendly worker import
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      workerRef.current = new Worker(new URL('../workers/ingest.worker.js', import.meta.url))
      workerRef.current.onmessage = (ev) => {
        const data = ev.data
        const task = tasks.current.get(data.id)
        if (!task) return
        if (!data.ok) {
          task.status = 'error'
          tasks.current.set(data.id, task)
          return
        }

        ;(async () => {
          // reconstruct blob and persist via Dexie (main-thread IO)
          const blob = new Blob([data.arrayBuffer], { type: data.fileType || 'application/octet-stream' })
          const coverColor = data.coverColor ?? ('#' + (String(data.fileName || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0) & 0xffffff).toString(16).padStart(6, '0'))
          const rec: BookRecord = {
            title: data.meta?.title ?? data.fileName ?? 'Untitled',
            author: data.meta?.author ?? 'Unknown',
            coverColor: coverColor,
            coverDataUrl: data.meta?.coverDataUrl ?? null,
            fileBlob: blob,
            fileName: data.fileName,
            fileType: data.fileType,
            category: data.meta?.category ?? 'Library',
            addedAt: Date.now(),
            progress: { wordIndex: 0, percentage: 0, lastRead: Date.now() }
          }
          const id = await db.books.add(rec)
          const all = await db.books.orderBy('addedAt').reverse().toArray()
          setBooks(all)
          setRecent(all.slice(0,3))
          task.status = 'done'
          tasks.current.set(data.id, task)
        })()
      }
    }
    return workerRef.current
  }, [])

  const addBook = useCallback(async (file: File, meta?: Partial<BookRecord>) => {
    const id = String(Math.random()).slice(2)
    tasks.current.set(id, { id, status: 'pending' })
    const w = getWorker()
    w.postMessage({ id, file, meta })
    return id
  }, [getWorker])

  const deleteBook = useCallback(async (id: number) => {
    await db.books.delete(id)
    const all = await db.books.orderBy('addedAt').reverse().toArray()
    setBooks(all)
    setRecent(all.slice(0,3))
  }, [])

  const updateProgress = useCallback(async (id: number, progress: Partial<BookRecord['progress']>) => {
    const rec = await db.books.get(id)
    if (!rec) return
    const next = { ...(rec.progress || { wordIndex: 0, percentage: 0, lastRead: 0 }), ...progress, lastRead: Date.now() }
    await db.books.update(id, { progress: next })
    const all = await db.books.orderBy('addedAt').reverse().toArray()
    setBooks(all)
    setRecent(all.slice(0,3))
  }, [])

  const importFromUrl = useCallback(async (url: string, meta?: Partial<BookRecord>) => {
    setLoading(true)
    const res = await fetch(url)
    const blob = await res.blob()
    const file = new File([blob], meta?.title ?? 'download', { type: blob.type })
    await addBook(file, meta)
    setLoading(false)
  }, [addBook])

  return {
    books,
    recent,
    loading,
    addBook,
    importFromUrl,
    deleteBook,
    updateProgress
  }
}
