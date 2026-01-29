import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

export type RSVPState = {
  words: string[]
  currentWordIndex: number
  previousWordIndex: number | null
  isPlaying: boolean
  wpm: number
  play: () => void
  pause: () => void
  toggle: () => void
  setWpm: (n: number) => void
  seek: (i: number) => void
  reset: () => void
}

export function orpIndexForWordLength(n: number){
  if (n <= 1) return 0
  if (n >= 2 && n <= 5) return 1
  if (n >= 6 && n <= 9) return 2
  if (n >= 10 && n <= 13) return 3
  return 4
}

const DEFAULT_STOP_WORDS = new Set(['the','and','of','for','a','an','to','in','on','is','it','that','with','as','at'])

function isNumericToken(t: string){
  // allow commas and dots inside numbers like 1,240.50
  return /^[\d][\d,\.]*$/.test(t)
}

function tokenizeKeepingPunctuation(text: string){
  if (!text) return [] as string[]
  // split on whitespace but keep punctuation attached to tokens
  return Array.from(text.match(/\S+/g) ?? [])
}

export default function useRSVP(text: string, opts?: { initialWpm?: number; naturalPacing?: boolean; stopWords?: string[] }){
  const naturalPacing = opts?.naturalPacing ?? true
  const stopWords = useMemo(() => new Set([...(opts?.stopWords ?? []), ...Array.from(DEFAULT_STOP_WORDS)]), [opts?.stopWords])

  const words = useMemo(() => tokenizeKeepingPunctuation(text), [text])

  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [previousWordIndex, setPreviousWordIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [wpm, setWpmState] = useState(opts?.initialWpm ?? 350)

  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const elapsedRef = useRef(0)
  const currentDelayRef = useRef(0)
  const isPlayingRef = useRef(false)
  const indexRef = useRef(0)

  // compute delay for a token index (ms) — Proportional Reading Theory (logarithmic length scale)
  const computeDelayForIndex = useCallback((i: number) => {
    const token = words[i] ?? ''
    const stripped = token.replace(/[^\p{L}\p{N}]/gu, '') // letters & numbers only
    const length = Math.max(1, stripped.length || token.length)

    const Base = 60000 / Math.max(1, wpm) // base ms per word at target WPM

    // logarithmic length scaling: gentle growth that avoids long-word dragging
    let lengthFactor = 1
    if (naturalPacing && length > 1) {
      lengthFactor = 1 + Math.log10(Math.max(1, length)) * 0.5
    }

    let multiplier = lengthFactor

    const lower = token.toLowerCase()
    // Stop-word "sling": boost momentum on common function words
    if (stopWords.has(lower)) multiplier *= 0.8

    // Numeric tokens demand more cognitive processing
    if (isNumericToken(token)) multiplier *= 1.5

    // punctuation-aware: stay-on punctuation words; slow-in before strong sentence breaks
    const endsPunct = /[\.\?\!]$/.test(token)
    if (endsPunct) {
      multiplier *= 2.5 // stay-on punctuation
    } else {
      const next = words[i + 1]
      if (next && /[\.\?\!]/.test(next)) {
        // anticipation when the NEXT token ends a sentence (slow-in)
        multiplier *= 1.3
      }
    }

    // compute raw delay
    let delay = Math.max(12, Math.round(Base * multiplier))

    // focus-reset cooldown: small extra after very long previous word
    const prev = words[i - 1]
    if (prev) {
      const prevLen = Math.max(0, prev.replace(/[^\p{L}\p{N}]/gu, '').length || prev.length)
      if (prevLen > 12) delay += 50
    }

    return delay
  }, [wpm, words, naturalPacing, stopWords])

  // ensure refs reflect state
  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { indexRef.current = currentWordIndex }, [currentWordIndex])

  // when words/wpm change, precompute currentDelay
  useEffect(() => {
    currentDelayRef.current = computeDelayForIndex(currentWordIndex)
  }, [computeDelayForIndex, currentWordIndex, wpm, words.length])

  const advance = useCallback(() => {
    setPreviousWordIndex(prev => (currentWordIndex >= 0 ? currentWordIndex : null))
    setCurrentWordIndex(i => {
      const next = Math.min(i + 1, Math.max(0, words.length - 1))
      indexRef.current = next
      return next
    })
  }, [currentWordIndex, words.length])

  // RAF-driven loop for frame-perfect swaps
  useEffect(() => {
    function step(ts: number){
      if (!isPlayingRef.current) return
      if (lastTsRef.current == null) lastTsRef.current = ts
      const delta = ts - lastTsRef.current
      lastTsRef.current = ts
      elapsedRef.current += delta

      const target = currentDelayRef.current || computeDelayForIndex(indexRef.current)
      if (elapsedRef.current >= target) {
        elapsedRef.current = 0
        // advance word
        if (indexRef.current >= words.length - 1) {
          setIsPlaying(false)
          isPlayingRef.current = false
          return
        }
        setPreviousWordIndex(indexRef.current)
        indexRef.current = Math.min(indexRef.current + 1, words.length - 1)
        setCurrentWordIndex(indexRef.current)
        // recompute next target immediately
        currentDelayRef.current = computeDelayForIndex(indexRef.current)
      }
      rafRef.current = window.requestAnimationFrame(step)
    }

    if (isPlaying) {
      lastTsRef.current = null
      elapsedRef.current = 0
      currentDelayRef.current = computeDelayForIndex(indexRef.current)
      rafRef.current = window.requestAnimationFrame(step)
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
      elapsedRef.current = 0
    }
  }, [isPlaying, computeDelayForIndex, words.length])

  useEffect(() => {
    // reset when text changes
    setCurrentWordIndex(0)
    setPreviousWordIndex(null)
    setIsPlaying(false)
    indexRef.current = 0
  }, [text])

  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])
  const toggle = useCallback(() => setIsPlaying(s => !s), [])
  const seek = useCallback((i: number) => {
    const idx = Math.max(0, Math.min(i, words.length - 1))
    setPreviousWordIndex(null)
    setCurrentWordIndex(idx)
    indexRef.current = idx
  }, [words.length])
  const reset = useCallback(() => {
    setPreviousWordIndex(null)
    setCurrentWordIndex(0)
    setIsPlaying(false)
    indexRef.current = 0
  }, [])
  const setWpm = useCallback((n: number) => setWpmState(() => Math.max(20, Math.min(5000, Math.round(n)))), [])

  return {
    words,
    currentWordIndex,
    previousWordIndex,
    isPlaying,
    wpm,
    play,
    pause,
    toggle,
    setWpm,
    seek,
    reset
  } as RSVPState & { words: string[] }
}
