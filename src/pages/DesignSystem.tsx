import React from 'react'
import { Book, Play, Settings, Search, Calendar } from 'lucide-react'
import FlowButton from '../components/FlowButton'
import BookCard from '../components/BookCard'
import NavigationDock from '../components/NavigationDock'
import IconOnly from '../components/IconOnly'
import { useTheme } from '../context/ThemeContext'
import RSVPDisplay from '../components/RSVPDisplay'
import { LayoutGroup } from 'framer-motion'
import FlowReader from '../components/FlowReader'
import useRSVP from '../hooks/useRSVP'
import Bookshelf from './Bookshelf'
import BentoSettings from './BentoSettings'

export default function DesignSystem(){
  const { toggleTheme } = useTheme()

  async function offlineCheck(){
    try {
      // check a cached asset
      const c = await caches.open('asset-cache')
      const match = await c.match('/index.html')
      const ok = !!match
      // check Dexie: quick read
      const { books } = await import('../hooks/useLibrary').then(m => ({ books: (m.default as any)().books }))
      const dbOk = Array.isArray(books)
      return ok && dbOk
    } catch (err) { return false }
  }

  return (
    <section className="py-6 px-2">
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold leading-tight">Flow RSVP — Design System</h1>
          <p className="text-sm text-ink/70 mt-2">8px baseline · Squircle-first · 2px ink stroke · Paper White palette</p>
        </div>
        <div className="flex items-center gap-3">
          <FlowButton onClick={toggleTheme} aria-label="toggle theme">
            <IconOnly><Settings /></IconOnly>
          </FlowButton>
        </div>
      </header>

      {/* Palette */}
      <section className="mb-8 grid grid-cols-3 gap-4 items-start">
        <div className="space-y-3">
          <div className="w-40 h-20 rounded-squircle-md bg-paper border-2 border-ink shadow-hard-stop flex items-center justify-center">Paper</div>
          <div className="w-40 h-12 rounded-squircle-md bg-white/60 border-2 border-ink/20 flex items-center justify-center">Glass (dock)</div>
        </div>
        <div className="space-y-3">
          <div className="w-40 h-20 rounded-squircle-md bg-ink text-white flex items-center justify-center">Jet Ink</div>
          <div className="w-40 h-12 rounded-squircle-md bg-safety text-white flex items-center justify-center">Safety Orange (focus)</div>
        </div>
        <div className="space-y-3">
          <div className="w-40 h-20 rounded-squircle-md bg-mint flex items-center justify-center">Soft Mint (highlight)</div>
          <div className="w-40 h-12 rounded-squircle-md bg-white border-2 border-ink flex items-center justify-center">Stroke — 2px</div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-8">
        <h2 className="text-lg mb-3">Flow-Button</h2>
        <div className="flex items-center gap-3">
          <FlowButton aria-label="play" className="w-14 h-14 p-0">
            <IconOnly><Play /></IconOnly>
          </FlowButton>

          <FlowButton variant="ghost" aria-label="search" className="w-14 h-14 p-0">
            <IconOnly><Search /></IconOnly>
          </FlowButton>

          <FlowButton tone="safety" aria-label="safety" className="w-14 h-14 p-0">
            <IconOnly><Calendar /></IconOnly>
          </FlowButton>
        </div>
        <p className="text-sm text-ink/60 mt-3">Press animation: 2px down-right to "swallow" the 4px hard-stop shadow.</p>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={async () => {
            const ok = await offlineCheck()
            alert(ok ? 'Offline check: OK — Bookshelf + RSVP read from IndexedDB' : 'Offline check: FAILED — try again'
            )
          }} className="rounded-squircle-md border-2 border-ink px-3 py-2 bg-white">Run offline verification</button>
          <div className="text-sm text-ink/60">(verifies cached shell + Dexie read)</div>
        </div>      </section>

      {/* Book grid */}
      <section className="mb-12">
        <h2 className="text-lg mb-3">Book-Card (grid)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="w-full max-w-[220px] aspect-[3/4] bg-white border-2 border-ink rounded-squircle-lg p-4 shadow-hard-stop-sm flex items-center justify-center">
            <Book size={44} strokeWidth={1.5} />
          </div>
          <div className="w-full max-w-[220px] aspect-[3/4] bg-white border-2 border-ink rounded-squircle-lg p-4 shadow-hard-stop-sm flex items-center justify-center">
            <Book size={44} strokeWidth={1.5} />
          </div>
          <div className="w-full max-w-[220px] aspect-[3/4] bg-white border-2 border-ink rounded-squircle-lg p-4 shadow-hard-stop-sm flex items-center justify-center">
            <Book size={44} strokeWidth={1.5} />
          </div>
        </div>
        <p className="text-sm text-ink/60 mt-3">Symbol-only center icon; spacing follows the 8px baseline.</p>

        <div className="mt-6">
          <h3 className="text-lg mb-3">Bookshelf (preview)</h3>
          <div className="bg-paper rounded-squircle-md p-4 border-2 border-ink">
            {/* lazy render bookshelf preview */}
            <Bookshelf />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg mb-3">Bento — Settings dashboard</h3>
          <div className="bg-paper rounded-squircle-md p-4 border-2 border-ink">
            <BentoSettings />
          </div>
        </div>

        <div className="w-full h-36 flex items-center justify-center bg-paper rounded-squircle-md">
          <div className="w-full max-w-lg">
            <div className="h-32 relative">
              {/* dock rendered so you can preview placement */}
              <div className="absolute inset-0 flex items-end justify-center">
                <NavigationDock />
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* RSVP Stationary-Pivot demo */}
      <section className="mb-12">
        <h2 className="text-lg mb-3">RSVP — Stationary Pivot (ORP)</h2>
        <div className="w-full max-w-2xl bg-white border-2 border-ink rounded-squircle-lg p-4">
          <p className="text-sm text-ink/60 mb-4">The focus character (ORP) is fixed at 35% from the left — the word moves beneath the stationary pivot.</p>
          <RSVPDemo />
        </div>
      </section>

      {/* Flow ↔ RSVP high-fidelity demo */}
      <section className="mb-20">
        <FlowDemo />
      </section>

      <footer className="text-xs text-ink/50 pb-40">© Flow RSVP — 8px baseline enforced · squircle-first components · lucide-react icons (stroke 1.5)</footer>
    </section>
  )
}

/* Local RSVP demo component (kept inside the style guide for easy iteration) */
function RSVPDemo(){
  const defaultSample = `In 2024, Flow RSVP turns static documents into a rhythmic, meditative text stream. It handles numbers like 1,240.50, pauses before punctuation, and gives the brain a tiny recovery after longwords.`
  const [text] = React.useState(defaultSample)
  const [natural, setNatural] = React.useState(true)
  const rsvp = useRSVP(text, { initialWpm: 420, naturalPacing: natural })

  const copySyncLink = () => {
    const url = new URL(window.location.href)
    url.searchParams.set('book', 'demo')
    url.searchParams.set('i', String(rsvp.currentWordIndex))
    navigator.clipboard?.writeText(url.toString())
  }

  return (
    <div className="space-y-4">
      <div>
        <RSVPDisplay words={rsvp.words} index={rsvp.currentWordIndex} isPlaying={rsvp.isPlaying} wpm={rsvp.wpm} />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={rsvp.toggle} className="p-2 rounded-squircle-md border-2 border-ink bg-white shadow-hard-stop-sm">
          {rsvp.isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={copySyncLink} className="p-2 rounded-squircle-md border-2 border-ink bg-white">Copy sync link</button>

        <div className="flex items-center gap-3">
          <label className="text-sm text-ink/60">WPM</label>
          <input aria-label="wpm" type="range" min={100} max={1200} value={rsvp.wpm} onChange={(e) => rsvp.setWpm(Number(e.target.value))} />
          <div className="text-sm text-ink/70 w-14 text-right">{rsvp.wpm}</div>
        </div>

        <label className="ml-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={natural} onChange={(e) => setNatural(e.target.checked)} />
          <span className="text-ink/70">Natural pacing (deep engine)</span>
        </label>

        <div className="ml-auto text-sm text-ink/60">word {rsvp.currentWordIndex + 1} / {rsvp.words.length}</div>
      </div>

      <div className="text-xs text-ink/50">Demo tokens: <span className="font-mono">{rsvp.words.slice(Math.max(0, rsvp.currentWordIndex-2), rsvp.currentWordIndex+3).join(' • ')}</span></div>
    </div>
  )
}

/* New FlowReader demo: demonstrates Viewport Anchor, shared-element morph, scroll-sync and hold-to-peek */
function FlowDemo(){
  const SAMPLE = `Flow turns long documents into readable, skimmable paragraphs. This demo shows the Flow (vertical) reader and the RSVP (focus) engine working together. Long-press any word to open a tiny Quick Stream. Toggle RSVP to see a shared-element morph.`
  const [text] = React.useState(SAMPLE.repeat(8))
  const words = React.useMemo(() => text.split(/\s+/).filter(Boolean), [text])
  // naive paragraph offsets for demo (every 28 words)
  const paragraphOffsets = React.useMemo(() => {
    const offsets: number[] = []
    for (let i = 0; i < words.length; i += 28) offsets.push(i)
    return offsets
  }, [words.length])

  const rsvp = useRSVP(words.join(' '), { initialWpm: 420, naturalPacing: true })
  const [showQuick, setShowQuick] = React.useState<{ index: number; words: string[]; anchor: { x: number; y: number } } | null>(null)
  const [showRSVP, setShowRSVP] = React.useState(false)
  const [sharedLayoutId, setSharedLayoutId] = React.useState<string | null>(null)

  const handleRequestEnter = (index: number, rect: DOMRect) => {
    // capture DOMRect -> (optional) use for animation origin; set sharedLayoutId so Framer Motion morphs
    setSharedLayoutId(`flow-word-${index}`)
    // sync the RSVP engine to the chosen word
    rsvp.seek(index)
    setShowRSVP(true)
    // small delay to ensure layoutId is registered on RSVP side before animation
    window.setTimeout(() => { document.body.classList.add('rsvp-open') }, 10)
  }

  return (
    <div className="bg-paper rounded-squircle-md p-4 border-2 border-ink space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg">Flow — High-Fidelity Lens Sync</h3>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { setShowRSVP(s => !s); if (!showRSVP) { setSharedLayoutId(`flow-word-${rsvp.currentWordIndex}`); } }} className="rounded-squircle-md border-2 border-ink px-3 py-2 bg-white">Toggle RSVP</button>
          <div className="text-sm text-ink/60">Try: long-press a word → Quick Stream · Double-click a word → morph to RSVP</div>
        </div>
      </div>

      {/* LayoutGroup enables Framer Motion shared-element morph between Flow and RSVP */}
      <LayoutGroup>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <FlowReader
              words={rsvp.words}
              paragraphOffsets={paragraphOffsets}
              currentIndex={rsvp.currentWordIndex}
              pulseMs={rsvp.currentDelayMs}
              onRequestEnterRSVP={handleRequestEnter}
              onPeek={(i: number, w: string[], anchor: { x: number; y: number }) => setShowQuick({ index: i, words: w, anchor })}
            />
          </div>

          <div>
            <div className="w-full max-w-md">
              {/* RSVP pane receives same useRSVP state so it's bi-directional */}
              <div className="bg-white border-2 border-ink rounded-2xl p-4">
                <RSVPDisplay words={rsvp.words} index={rsvp.currentWordIndex} isPlaying={rsvp.isPlaying} wpm={rsvp.wpm} sharedLayoutId={showRSVP && sharedLayoutId ? sharedLayoutId : undefined} />

                <div className="mt-3 flex items-center gap-3">
                  <button onClick={rsvp.toggle} className="p-2 rounded-squircle-md border-2 border-ink bg-white">{rsvp.isPlaying ? 'Pause' : 'Play'}</button>
                  <div className="text-sm text-ink/60">Current word: {rsvp.currentWordIndex + 1}</div>
                  <div className="ml-auto text-xs text-ink/50">Flow ↔ RSVP — frame-perfect morph</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LayoutGroup>

      {/* Quick Stream overlay */}
      {showQuick && (
        <div onClick={() => setShowQuick(null)}>
          <div className="fixed inset-0 bg-black/10" />
          <div className="pointer-events-none" />
        </div>
      )}

      {showQuick && (
        <div style={{ position: 'fixed', left: showQuick.anchor.x, top: showQuick.anchor.y, transform: 'translate(-50%, -120%)', zIndex: 60 }}>
          <div className="w-44 rounded-3xl bg-white border-2 border-ink p-3 shadow-hard-stop">
            <div className="text-xs text-ink/60 mb-2">Quick Stream</div>
            <RSVPDisplay words={showQuick.words} index={0} isPlaying={true} wpm={700} pivotPercent={0.5} />
            <div className="mt-2 text-right"><button onClick={() => setShowQuick(null)} className="text-xs text-ink/60">Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}

// add FlowDemo to the style guide lower in the page

