import React from 'react'
import useGutenberg from '../hooks/useGutenberg'
import SkeletonCard from '../components/SkeletonCard'
import { DownloadCloud, Globe, Search } from 'lucide-react'
import { fetchBlob, blobToFile } from '../utils/downloadManager'
import useLibrary from '../hooks/useLibrary'
import RSVPDisplay from '../components/RSVPDisplay'

export default function ArchiveView(){
  const { query, setQuery, results, loading, error, next, hasMore } = useGutenberg('')
  const { books, addBook } = useLibrary()
  const [previewWords, setPreviewWords] = React.useState<string[] | null>(null)
  const [previewIndex, setPreviewIndex] = React.useState(0)
  const [downloading, setDownloading] = React.useState<Record<number, boolean>>({})
  const [downloadedIds, setDownloadedIds] = React.useState<Set<number>>(new Set())

  React.useEffect(() => {
    const s = new Set<number>()
    for (const b of books) if (b.externalId) s.add(Number(b.externalId))
    setDownloadedIds(s)
  }, [books])

  async function handleDownload(r: any){
    if (downloadedIds.has(r.id)) return
    setDownloading(d => ({ ...d, [r.id]: true }))
    try {
      const url = r.epubUrl || r.textUrl
      if (!url) throw new Error('No downloadable format')
      const blob = await fetchBlob(url)
      const file = blobToFile(blob, `${r.title}.epub`)
      await addBook(file, { title: r.title, author: r.author, externalId: String(r.id), category: 'Archive' })
      setDownloadedIds(s => new Set(s).add(r.id))

      // haptic confirmation where available
      try { if (navigator.vibrate) navigator.vibrate(12) } catch (err) {}
    } catch (err) {
      console.error(err)
      alert('Download failed')
    } finally {
      setDownloading(d => ({ ...d, [r.id]: false }))
    }
  }

  async function handlePreview(r: any){
    setPreviewWords(null)
    try {
      const url = r.textUrl
      if (!url) { alert('Preview not available for this format'); return }
      const blob = await fetchBlob(url)
      const txt = await blob.text()
      const words = txt.replace(/\s+/g, ' ').trim().split(' ').slice(0, 100)
      setPreviewWords(words)
      setPreviewIndex(0)
    } catch (err) {
      console.error(err)
      alert('Preview failed')
    }
  }

  return (
    <section className="py-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex items-center gap-2 w-full max-w-xl">
          <Search className="absolute left-3 text-ink/50" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Project Gutenberg" className="pl-10 pr-4 py-3 rounded-squircle-md border-2 border-ink w-full bg-white" />
          <button className="ml-2 rounded-squircle-md border-2 border-ink px-3 py-2 bg-white flex items-center gap-2"><Globe /> Archive</button>
        </div>

        <div className="ml-auto text-sm text-ink/60">Search-as-you-type (300ms debounce)</div>
      </div>

      {previewWords ? (
        <div className="mb-6 bg-white border-2 border-ink rounded-squircle-md p-4">
          <div className="flex items-start gap-4">
            <div className="w-2/3"><RSVPDisplay words={previewWords} index={previewIndex} /></div>
            <div className="w-1/3">
              <div className="text-sm text-ink/70 mb-3">Preview — first 100 words</div>
              <div className="flex gap-2">
                <button className="rounded-squircle-md border-2 border-ink px-3 py-2 bg-white" onClick={() => setPreviewWords(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && results.length === 0 && (
          <div className="col-span-full text-center text-ink/60 py-20">No results — try "Pride" or "Shakespeare"</div>
        )}

        {results.map(r => (
          <div key={r.id} className="w-full">
            <div className="relative bg-white border-2 border-ink rounded-3xl p-3 shadow-hard-stop h-full flex flex-col" style={{height: 296}}>
              <img src={r.coverUrl} onError={(e)=>{ (e.currentTarget as HTMLImageElement).style.opacity='0.25' }} className="w-full h-40 object-cover rounded-2xl mb-3" alt="cover" />

              <div className="flex-1">
                <div className="text-sm font-semibold truncate">{r.title}</div>
                <div className="text-xs text-ink/60 mt-1">{r.author}</div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button onClick={() => handlePreview(r)} className="rounded-squircle-md border-2 border-ink px-3 py-2 bg-white">Stream sample</button>
                <button onClick={() => handleDownload(r)} disabled={downloading[r.id] || downloadedIds.has(r.id)} className="ml-auto rounded-squircle-md border-2 border-ink px-3 py-2 bg-white flex items-center gap-2">
                  {downloadedIds.has(r.id) ? 'Saved' : (downloading[r.id] ? 'Downloading...' : 'Download')}
                  <DownloadCloud size={14} />
                </button>
              </div>

              {downloadedIds.has(r.id) && <div className="absolute top-3 left-3 bg-safety text-white px-2 py-1 rounded-squircle-sm text-xs">New</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        {hasMore && <button onClick={() => next()} className="rounded-squircle-md border-2 border-ink px-4 py-2 bg-white">Load more</button>}
        {error && <div className="text-red-500 mt-3">{error}</div>}
      </div>
    </section>
  )
}
