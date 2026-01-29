import React from 'react'
import useLibrary from '../hooks/useLibrary'
import BookCard from '../components/BookCard'

export default function Bookshelf(){
  const { books, recent, addBook, deleteBook, updateProgress, importFromUrl, loading } = useLibrary()
  const fileRef = React.useRef<HTMLInputElement | null>(null)

  const onFile = async (f?: FileList | null) => {
    const file = f?.[0]
    if (!file) return
    await addBook(file)
  }

  return (
    <section className="py-6 px-2">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Bookshelf</h2>
          <p className="text-sm text-ink/60 mt-1">Your offline vault · drag & drop to add · 8px grid</p>
        </div>

        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="application/pdf,application/epub+zip" className="hidden" onChange={(e) => onFile(e.target.files)} />
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
