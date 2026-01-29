import React from 'react'
import type { Token } from '../types/token'

type Props = {
  words: string[]
  index: number
  pivotPercent?: number
  width?: number
  height?: number
  wpm?: number
  isPlaying?: boolean
  className?: string
}

// tiny spring solver for sub-20ms feel
function stepSpring(current: number, target: number, velocityRef: { v: number }, dt: number, stiffness = 1000, damping = 50){
  // semi-implicit Euler
  const mass = 1
  const force = -stiffness * (current - target) - damping * velocityRef.v
  const accel = force / mass
  velocityRef.v += accel * dt
  current += velocityRef.v * dt
  return current
}

export default function RSVPCanvas({ words, index, pivotPercent = 0.35, width = 900, height = 96, isPlaying = false, wpm = 300, className }: Props){
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const prevWordRef = React.useRef<string | null>(null)
  const xRef = React.useRef(0)
  const vRef = React.useRef({ v: 0 })
  const device = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1

  React.useLayoutEffect(() => {
    const c = canvasRef.current
    if (!c) return
    c.width = Math.round(width * device)
    c.height = Math.round(height * device)
    c.style.width = `${width}px`
    c.style.height = `${height}px`
    const ctx = c.getContext('2d')!
    ctx.setTransform(device, 0, 0, device, 0, 0)
    ctx.textBaseline = 'middle'
    ctx.font = `600 48px "JetBrains Mono", ui-monospace, monospace`

    function draw(){
      const word = words[index] ?? ''
      const orp = (() => {
        const n = word.length
        if (n <= 1) return 0
        if (n <= 5) return 1
        if (n <= 9) return 2
        if (n <= 13) return 3
        return 4
      })()

      // bionic: bold first up-to-3 letters (visual weight)
      const bionicCount = Math.min(3, word.length)

      // measure segments
      const pre = word.slice(0, Math.max(0, orp))
      const preBionic = pre.slice(0, bionicCount)
      const preRest = pre.slice(bionicCount)
      const orpChar = word[orp] ?? ''
      const post = word.slice(orp + 1)

      // measure widths
      ctx.font = `700 48px "JetBrains Mono", ui-monospace, monospace`
      const preBionicW = ctx.measureText(preBionic).width
      ctx.font = `600 48px "JetBrains Mono", ui-monospace, monospace`
      const preRestW = ctx.measureText(preRest).width
      const orpW = ctx.measureText(orpChar).width
      const postW = ctx.measureText(post).width

      const totalW = preBionicW + preRestW + orpW + postW

      // pivot target (absolute x in canvas coordinates)
      const pivotX = width * pivotPercent
      // compute ORP center offset from word origin
      const focusCenter = preBionicW + preRestW + orpW / 2
      const targetX = pivotX - focusCenter

      // animate xRef toward target using spring (dt seconds)
        const now = performance.now()
      const last = (RSVPCanvas as any)._lastTsRef ?? now
      const dt = Math.min(0.016, (now - last) / 1000)
      ;(RSVPCanvas as any)._lastTsRef = now
      xRef.current = stepSpring(xRef.current, targetX, vRef.current, dt, 1000, 50)

      // clear
      ctx.clearRect(0, 0, width, height)

      // background is transparent — parent supplies paper

      // ghost trail (very subtle)
      if (prevWordRef.current && prevWordRef.current !== word) {
        ctx.save()
        ctx.globalAlpha = 0.05
        ctx.fillStyle = '#1A1A1A'
        ctx.font = `600 48px "JetBrains Mono", ui-monospace, monospace`
        ctx.fillText(prevWordRef.current, xRef.current, height / 2)
        ctx.restore()
      }

      // draw word with bionic + ORP styling
      const originX = xRef.current
      let cursor = originX

      // preBionic
      ctx.save()
      ctx.font = `800 48px "JetBrains Mono", ui-monospace, monospace`
      ctx.fillStyle = '#1A1A1A'
      ctx.fillText(preBionic, cursor, height / 2)
      cursor += preBionicW
      ctx.restore()

      // preRest
      ctx.save()
      ctx.font = `600 48px "JetBrains Mono", ui-monospace, monospace`
      ctx.fillStyle = '#1A1A1A'
      ctx.fillText(preRest, cursor, height / 2)
      cursor += preRestW
      ctx.restore()

      // ORP char
      ctx.save()
      ctx.font = `700 48px "JetBrains Mono", ui-monospace, monospace`
      ctx.fillStyle = '#FF5C00'
      ctx.fillText(orpChar, cursor, height / 2)
      cursor += orpW
      ctx.restore()

      // post
      ctx.save()
      ctx.font = `600 48px "JetBrains Mono", ui-monospace, monospace`
      ctx.fillStyle = '#1A1A1A'
      ctx.fillText(post, cursor, height / 2)
      ctx.restore()

      prevWordRef.current = word
    }

    let raf = 0
    function loop(){
      draw()
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [words, index, pivotPercent, width, height, device])

  // reduced-motion: if true, render nothing or simple DOM fallback elsewhere
  return (
    <canvas ref={canvasRef} className={className} width={width} height={height} style={{ width, height, borderRadius: 20, display: 'block' }} aria-hidden />
  )
}
