import React from 'react'

type Props = { children: React.ReactNode }

export default function GlobalLayout({ children }: Props){
  React.useEffect(() => {
    // Prevent iOS pull-to-refresh when at top by blocking the overscroll gesture when appropriate
    let startY = 0
    function onTouchStart(e: TouchEvent){ startY = e.touches[0].clientY }
    function onTouchMove(e: TouchEvent){
      const el = document.scrollingElement || document.documentElement
      if (!el) return
      const scrollTop = el.scrollTop
      const curY = e.touches[0].clientY
      const isPullingDown = (curY > startY) && scrollTop <= 0
      if (isPullingDown) e.preventDefault()
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 bg-paper text-ink font-ui app-shell" style={{boxSizing: 'border-box'}}>
      <div className="w-full max-w-5xl">
        {/* provide a visual 8px grid context inside the design sandbox */}
        <div className="relative bg-transparent rounded-squircle-md overflow-visible">
          <div className="grid-overlay absolute inset-0 rounded-squircle-md" aria-hidden />
          <main className="relative z-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
