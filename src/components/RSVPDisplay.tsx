import React from 'react'
import { motion } from 'framer-motion'
import { orpIndexForWordLength } from '../hooks/useRSVP'

type Props = {
  words: string[]
  index: number
  pivotPercent?: number
  className?: string
  isPlaying?: boolean
  wpm?: number
}

export default function RSVPDisplay({ words, index, pivotPercent = 0.35, className, isPlaying = false, wpm = 300, sharedLayoutId }: Props & { sharedLayoutId?: string }){
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const wordRef = React.useRef<HTMLDivElement | null>(null)
  const focusCharRef = React.useRef<HTMLSpanElement | null>(null)
  const [translateX, setTranslateX] = React.useState(0)
  const prevTranslateRef = React.useRef(0)
  const prevWordRef = React.useRef<string | null>(null)
  const [prevWord, setPrevWord] = React.useState<string | null>(null)
  const [prevX, setPrevX] = React.useState(0)
  const [useCanvas, setUseCanvas] = React.useState(true)

  const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // lazily load canvas renderer via React.lazy so bundlers can code-split
  const RSVPCanvas = React.useMemo(() => React.lazy(() => import('./RSVPCanvas')), [])
  const prefersCanvas = true
  const canUseCanvas = typeof window !== 'undefined' && (!!(window as any).OffscreenCanvas || typeof document !== 'undefined')
  if (prefersCanvas && canUseCanvas && !reduceMotion) {
    const Canvas = RSVPCanvas as any
    return (
      <React.Suspense fallback={null}>
        <Canvas words={words} index={index} pivotPercent={pivotPercent} isPlaying={isPlaying} wpm={wpm} className={className} />
      </React.Suspense>
    )
  }

  const word = words[index] ?? ''
  const orp = React.useMemo(() => orpIndexForWordLength(word.length), [word])

  // compute translateX for the current word so the ORP char sits at pivotPercent * width
  React.useLayoutEffect(() => {
    const container = containerRef.current
    const focusEl = focusCharRef.current
    const wordEl = wordRef.current
    // capture previous state for ghost-trail before measuring new word
    prevTranslateRef.current = translateX
    prevWordRef.current = prevWordRef.current ?? word

    if (!container || !focusEl || !wordEl) return setTranslateX(0)

    const containerRect = container.getBoundingClientRect()
    const pivotX = containerRect.left + containerRect.width * pivotPercent

    const focusRect = focusEl.getBoundingClientRect()
    const focusCenter = focusRect.left + focusRect.width / 2

    const delta = pivotX - focusCenter
    const rounded = Math.round(delta)

    // store previous for ghost
    setPrevWord(prevWordRef.current)
    setPrevX(prevTranslateRef.current)
    // clear previous after short persistence (20ms)
    window.setTimeout(() => setPrevWord(null), reduceMotion ? 0 : 20)

    // update
    setTranslateX(rounded)
    prevWordRef.current = word
  }, [word, index, pivotPercent, reduceMotion])

  // high-stiffness micro-spring for pivot shift (~15ms feel)
  const springTransition = reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 1000, damping: 50, restDelta: 0.5 }

  const showThought = !isPlaying && !!words.length
  const isHyper = (wpm || 0) > 500 && !reduceMotion

  return (
    <div className={"rsvp-display " + (className ?? '')} style={{padding: 16}}>
      <div ref={containerRef} className="rsvp-viewport w-full max-w-3xl mx-auto relative">
        {/* pivot guide - top and bottom small bars */}
        <div className="rsvp-pivot-line" style={{left: `${pivotPercent * 100}%`, transform: 'translateX(-50%) translateY(-120%)'}} aria-hidden />
        <div className="rsvp-pivot-line bottom" style={{left: `${pivotPercent * 100}%`, transform: 'translateX(-50%) translateY(120%)'}} aria-hidden />

        {/* thought bubble when paused */}
        {showThought && (
          <div className="rsvp-thought" aria-hidden>
            <svg width="28" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-ink/40">
              <path d="M21 15a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h10" />
              <path d="M7 10a3 3 0 0 0 3-3" />
            </svg>
          </div>
        )}

        {/* ghost trail (previous word) */}
        {prevWord && (
          <div
            aria-hidden
            className="rsvp-ghost"
            style={{ transform: `translateX(${prevX}px)`, left: 0, top: 0 }}
          >
            {Array.from(prevWord).map((ch, i) => (
              <span key={i} style={{ display: 'inline-block', padding: '0 2px' }}>{ch}</span>
            ))}
          </div>
        )}

        <motion.div
          ref={wordRef}
          className="rsvp-word text-4xl font-rsvp text-ink"
          layoutId={sharedLayoutId ?? undefined}
          animate={{ x: translateX }}
          transition={springTransition}
          aria-live="off"
        >
          {Array.from(word).map((ch, i) => {
            const isOrp = i === Math.min(orp, word.length - 1)
            return (
              <span
                key={i}
                ref={isOrp ? focusCharRef : undefined}
                aria-hidden
                className={`${isOrp ? 'rsvp-orp' : ''} ${isOrp && isHyper ? 'rsvp-orp--hyper' : ''}`}
                style={{ display: 'inline-block', padding: '0 2px' }}
              >
                {ch}
              </span>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
