import React from 'react'
import { twMerge } from 'tailwind-merge'

export default function NavigationDock({ className }: { className?: string }){
  return (
    <nav className={twMerge('fixed left-1/2 -translate-x-1/2 bottom-6 z-50 backdrop-blur-sm bg-white/60 border-2 border-ink rounded-squircle-lg px-4 py-2 flex gap-3 items-center shadow-hard-stop', className)} aria-label="Navigation Dock">
      <div className="flex gap-3">
        <button className="p-2 rounded-squircle-md border-2 border-ink bg-white shadow-hard-stop-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </button>
        <button className="p-2 rounded-squircle-md border-2 border-ink bg-white shadow-hard-stop-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="3" />
            <path d="M22 12a10 10 0 0 1-10 10" />
          </svg>
        </button>
        <button className="p-2 rounded-squircle-md border-2 border-safety bg-white text-safety shadow-hard-stop-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
