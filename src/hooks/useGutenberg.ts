import { useCallback, useEffect, useRef, useState } from 'react'

type GutenbergBook = {
  id: number
  title: string
  authors: Array<{ name: string }>
  formats: Record<string, string>
}

type Result = {
  id: number
  title: string
  author?: string
  epubUrl?: string
  textUrl?: string
  coverUrl?: string
}

export default function useGutenberg(initialQuery = ''){
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Result[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const debounceRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const extract = useCallback((b: GutenbergBook): Result => {
    const title = b.title
    const author = b.authors?.[0]?.name
    // prefer epub, then text/plain
    const epubUrl = b.formats['application/epub+zip'] || b.formats['application/x-mobipocket-ebook']
    const textUrl = b.formats['text/plain; charset=utf-8'] || b.formats['text/plain'] || b.formats['application/octet-stream']
    const coverUrl = `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.cover.medium.jpg`
    return { id: b.id, title, author, epubUrl, textUrl, coverUrl }
  }, [])

  const fetchPage = useCallback(async (q: string, p = 1) => {
    if (!q) {
      setResults([])
      setHasMore(false)
      return
    }
    setLoading(true)
    setError(null)
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    try {
      const res = await fetch(`https://gutendex.com/books?search=${encodeURIComponent(q)}&page=${p}`, { signal: ac.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const books: GutenbergBook[] = json.results || []
      const mapped = books.map(extract)
      setResults(prev => p === 1 ? mapped : [...prev, ...mapped])
      setHasMore(!!json.next)
      setPage(p)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [extract])

  // debounced query effect (300ms)
  useEffect(() => {
    window.clearTimeout(debounceRef.current ?? undefined)
    debounceRef.current = window.setTimeout(() => {
      fetchPage(query, 1)
    }, 300)
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [query, fetchPage])

  const next = useCallback(() => { if (hasMore) fetchPage(query, page + 1) }, [hasMore, fetchPage, page, query])

  return { query, setQuery, results, loading, error, hasMore, page, next, refetch: () => fetchPage(query, 1) }
}
