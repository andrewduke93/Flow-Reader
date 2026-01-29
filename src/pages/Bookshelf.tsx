import React from 'react'
import useLibrary from '../hooks/useLibrary'
import BookCard from '../components/BookCard'
import useFileProcessor from '../hooks/useFileProcessor'

export default function Bookshelf(){
  const { books, recent, addBook, deleteBook, updateProgress, importFromUrl, loading } = useLibrary()
  const fileRef = React.useRef<HTMLInputElement | null>(null)
  const dropZoneRef = React.useRef<HTMLDivElement | null>(null)

  const fileProcessor = useFileProcessor()
  const [parsingProgress, setParsingProgress] = React.useState(0)
  const onFile = async (f?: FileList | null) => {
    const file = f?.[0]
    if (!file) return
    // immediate UI feedback (synchronous) to meet 16ms frame requirement
    if (dropZoneRef.current) {
      dropZoneRef.current.classList.add('drop-loading')
      dropZoneRef.current.setAttribute('aria-busy', 'true')
    }
    try {
      const res = await fileProcessor.processFile(file, { maxTokens: 20000, onProgress: (p: number) => setParsingProgress(p) })
      setParsingProgress(0)
      await addBook(file, { title: res.metadata?.title ?? file.name, author: res.metadata?.author }, { tokens: res.tokens, thumbnail: res.thumbnail ?? null })
    } catch (err) {
      console.error(err)
      alert('Failed to process file')
      setParsingProgress(0)
    } finally {
      if (dropZoneRef.current) {
        dropZoneRef.current.classList.remove('drop-loading')
        dropZoneRef.current.removeAttribute('aria-busy')
      }
    }
  }

  return (
    <section className="py-6 px-2">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Bookshelf</h2>
          <p className="text-sm text-ink/60 mt-1">Your offline vault · drag & drop to add · 8px grid</p>
        </div>

        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="application/pdf,application/epub+zip,text/*" className="hidden" onChange={(e) => { if (dropZoneRef.current) { dropZoneRef.current.classList.add('drop-loading'); dropZoneRef.current.setAttribute('aria-busy','true') } onFile(e.target.files) }} />
          <button onClick={() => fileRef.current?.click()} className="rounded-squircle-md border-2 border-ink px-3 py-2 bg-white shadow-hard-stop">+ Add book</button>
          <button onClick={() => importFromUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { title: 'Dummy PDF' })} className="rounded-squircle-md border-2 border-ink px-3 py-2 bg-white">Import demo</button>
        </div>
      </header>

      {/* Recent carousel */}
      <div className="mb-6">
        <h3 className="text-sm text-ink/70 mb-2">Recent</h3>
        <div className="flex gap-3 overflow-auto py-2">
          {recent.length === 0 && (
            <div className="w-full rounded-squircle-md bg-paper border-2 border-ink/6 p-6 text-center">No recent reads</div>
          )}
          {recent.map(b => (
            <div key={b.id} className="min-w-[140px] max-w-[200px]">
              <BookCard id={b.id} title={b.title} author={b.author} coverColor={b.coverColor} coverDataUrl={b.coverDataUrl || null} percentage={b.progress?.percentage ?? 0} onOpen={() => console.log('open', b.id)} onRSVP={() => console.log('rsvp', b.id)} onDelete={() => deleteBook(b.id!)} />
            </div>
          ))}

          {/* Drop zone (empty state inline) */}
          <div className="min-w-[160px] max-w-[220px]">
            <div
              ref={(el) => dropZoneRef.current = el}
              onDragEnter={(e) => { e.preventDefault(); /* immediate visual feedback within a frame */ if (dropZoneRef.current) dropZoneRef.current.classList.add('drop-loading'); dropZoneRef.current?.setAttribute('aria-busy','true') }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={(e) => { e.preventDefault(); if (dropZoneRef.current) dropZoneRef.current.classList.remove('drop-loading'); dropZoneRef.current?.removeAttribute('aria-busy') }}
              onDrop={(e) => { e.preventDefault(); if (dropZoneRef.current) dropZoneRef.current.classList.remove('drop-loading'); dropZoneRef.current?.removeAttribute('aria-busy'); onFile(e.dataTransfer?.files) }}
              className="h-40 rounded-3xl border-2 border-dashed border-ink/40 bg-white/60 flex flex-col items-center justify-center gap-3 p-4 drop-zone"
              role="button"
              tabIndex={0}
            >
              <div className="text-3xl">⬇️</div>
              <div className="text-sm text-ink/60">Drop a PDF or EPUB to add</div>
              <div className="text-xs text-ink/40 mt-2">Flowy will strip the noise — parsing in background</div>
              <div className="w-full mt-2 h-2 bg-ink/6 rounded">
                <div className="h-2 bg-safety rounded" style={{ width: `${parsingProgress}%`, transition: 'width 160ms cubic-bezier(.2,.9,.2,1)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Grid */}
      {books.length === 0 ? (
        <div className="w-full h-[48vh] grid place-items-center">
          <div className="text-center space-y-4">
            <div className="w-36 h-36 rounded-3xl bg-white/60 border-2 border-ink/10 grid place-items-center">
              <div className="text-4xl">🌊</div>
            </div>
            <div className="text-lg font-semibold">The shelf is looking a bit light, man.</div>
            <div className="text-sm text-ink/60">Want to grab something from the archive? Drag a PDF here or click "Add book".</div>
            <div>
              <button onClick={() => importFromUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', { title: 'Demo PDF' })} className="mt-3 rounded-squircle-md border-2 border-ink px-3 py-2 bg-white shadow-hard-stop">Add demo</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {books.map(b => (
            <BookCard key={b.id} id={b.id} title={b.title} author={b.author} coverColor={b.coverColor} coverDataUrl={b.coverDataUrl || null} percentage={b.progress?.percentage ?? 0} onOpen={() => console.log('open', b.id)} onRSVP={() => console.log('rsvp', b.id)} onDelete={() => deleteBook(b.id!)} />
          ))}
        </div>
      )}

      <div className="h-20" />
    </section>
  )
}
