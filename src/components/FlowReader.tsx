import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RSVPDisplay from './RSVPDisplay'

type FlowReaderProps = {
  words: string[]
  paragraphOffsets: number[] // indices where paragraphs start
  currentIndex: number
  pulseMs?: number
  onRequestEnterRSVP?: (index: number, rect: DOMRect) => void
  onPeek?: (index: number, words: string[], anchor: { x: number; y: number }) => void
} 

// renders words grouped by paragraph; each paragraph is a variable-height block
export default function FlowReader({ words, paragraphOffsets, currentIndex, pulseMs, onRequestEnterRSVP, onPeek }: FlowReaderProps){
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const paragraphRefs = React.useRef<Map<number, HTMLDivElement>>(new Map())

  // build paragraphs array from offsets
  const paragraphs = React.useMemo(() => {
    const p: string[][] = []
    for (let i = 0; i < paragraphOffsets.length; i++){
      const start = paragraphOffsets[i]
      const end = paragraphOffsets[i+1] ?? words.length
      p.push(words.slice(start, end))
    }
    return p
  }, [words, paragraphOffsets])

  // map global word index -> paragraph index & local index
  const locate = React.useCallback((globalIndex: number) => {
    let p = paragraphOffsets.length - 1
    for (let i = 0; i < paragraphOffsets.length; i++){
      if (paragraphOffsets[i] <= globalIndex) p = i
      else break
    }
    const local = globalIndex - paragraphOffsets[p]
    return { p, local }
  }, [paragraphOffsets])

  // center the active word when RSVP runs (smooth: paragraph -> then precise word centering)
  React.useEffect(() => {
    const { p } = locate(currentIndex)
    const paraEl = paragraphRefs.current.get(p)
    if (paraEl && containerRef.current) {
      try {
        paraEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } catch (err) {
        const containerRect = containerRef.current!.getBoundingClientRect()
        const r = paraEl.getBoundingClientRect()
        const dy = (r.top + r.height / 2) - (containerRect.top + containerRect.height / 2)
        containerRef.current!.scrollBy({ top: dy, behavior: 'smooth' })
      }
    }

    // then try to precisely center the active word (wait for paragraph to be rendered)
    let tries = 0
    const tryCenter = () => {
      tries += 1
      const wordEl = containerRef.current?.querySelector(`[data-word-index="${currentIndex}"]`) as HTMLElement | null
      if (wordEl) {
        wordEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
        return
      }
      if (tries < 8) window.setTimeout(tryCenter, 40)
    }
    window.setTimeout(tryCenter, 60)
  }, [currentIndex, locate])

  // IntersectionObserver to mark active paragraph (high-performance)
  React.useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        const el = en.target as HTMLDivElement
        if (en.isIntersecting && en.intersectionRatio > 0.55) {
          el.dataset.active = 'true'
        } else {
          el.dataset.active = 'false'
        }
      })
    }, { root: null, threshold: [0.0, 0.55, 1.0] })

    paragraphRefs.current.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  // compute which word is closest to vertical center inside the currently-active paragraph
  const findViewportAnchor = React.useCallback(() => {
    if (!containerRef.current) return null
    const containerRect = containerRef.current.getBoundingClientRect()
    const centerY = containerRect.top + containerRect.height / 2

    // find paragraph that is active
    let activePara: HTMLDivElement | null = null
    paragraphRefs.current.forEach(el => {
      if (el.dataset.active === 'true') activePara = el
    })
    if (!activePara) {
      // fallback: pick the paragraph that contains the currentIndex
      const { p } = locate(currentIndex)
      activePara = paragraphRefs.current.get(p) ?? null
      if (!activePara) return null
    }

    // within the active paragraph, find the word span whose center is nearest to centerY
    const wordEls = Array.from(activePara.querySelectorAll('[data-word-index]')) as HTMLElement[]
    if (!wordEls.length) return null

    let best: { el: HTMLElement; idx: number; dy: number } | null = null
    for (const el of wordEls){
      const idx = Number(el.dataset.wordIndex)
      const r = el.getBoundingClientRect()
      const cy = r.top + r.height / 2
      const dy = Math.abs(cy - centerY)
      if (!best || dy < best.dy) best = { el, idx, dy }
    }
    if (!best) return null
    return { index: best.idx, rect: best.el.getBoundingClientRect() }
  }, [currentIndex, locate])

  // public API: when user requests RSVP from Flow, compute anchor and call parent
  const handleEnterRSVP = React.useCallback((fromIndex?: number) => {
    const anchor = findViewportAnchor()
    if (!anchor) return
    onRequestEnterRSVP?.(anchor.index, anchor.rect)
  }, [findViewportAnchor, onRequestEnterRSVP])

  // hold-to-peek gesture implementation
  const longPressTimer = React.useRef<number | null>(null)
  const pointerStart = React.useRef<{ x: number; y: number; idx: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent, globalIndex: number) => {
    pointerStart.current = { x: e.clientX, y: e.clientY, idx: globalIndex }
    longPressTimer.current = window.setTimeout(() => {
      // show quick stream for next 6 words
      const start = globalIndex
      const peekWords = words.slice(start, Math.min(words.length, start + 6))
      onPeek?.(start, peekWords, { x: e.clientX, y: e.clientY })
    }, 360)
  }
  const onPointerUp = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current)
    longPressTimer.current = null
    pointerStart.current = null
  }

  // render paragraph content — each word gets a data-word-index and a layoutId for shared-layout
  const renderParagraph = (para: string[], pIdx: number) => {
    const globalStart = paragraphOffsets[pIdx]
    return (
      <div
        ref={(el) => { if (el) paragraphRefs.current.set(pIdx, el); else paragraphRefs.current.delete(pIdx) }}
        key={pIdx}
        className="flow-paragraph text-base leading-7 text-ink/90 max-w-3xl mx-auto py-3"
        data-paragraph-index={pIdx}
        role="article"
      >
        {para.map((w, i) => {
          const gi = globalStart + i
          const isActive = gi === currentIndex
          return (
            <span
              key={gi}
              data-word-index={gi}
              onPointerDown={(ev) => onPointerDown(ev, gi)}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onDoubleClick={() => handleEnterRSVP(gi)}
              className={`inline-block mr-2 mb-1 relative flow-word ${isActive ? 'flow-word--active' : ''}`}
            >
              {/* shared-element layoutId so the word can morph into the RSVP pivot */}
              <motion.span layoutId={`flow-word-${gi}`} className="inline-block">{w}</motion.span>
              {isActive && (
                <motion.span
                  aria-hidden
                  className="absolute left-0 right-0 -bottom-1 h-0.5 bg-safety origin-center"
                  initial={{ scaleX: 0.85, opacity: 0.95 }}
                  animate={currentIndex !== undefined ? { scaleX: [1, 1.22, 1], opacity: [1, 0.82, 1] } : {}}
                  transition={{ repeat: Infinity, repeatType: 'loop', duration: Math.max(0.12, (pulseMs ?? 300) / 1000), ease: 'easeInOut' }}
                />
              )}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flow-reader w-full max-w-3xl mx-auto relative">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => handleEnterRSVP()} className="rounded-squircle-md border-2 border-ink px-3 py-2 bg-white">Enter RSVP (anchor)</button>
        <div className="text-sm text-ink/60">Tap a word or long-press to Quick‑Peek</div>
      </div>

      <div style={{ height: 520, overflow: 'auto' }}>
        <div>
          {paragraphs.map((para, idx) => (
            <div key={idx}>
              {renderParagraph(para, idx)}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence />
    </div>
  )
}
