import React from 'react'
import { motion } from 'framer-motion'

export type BookCardProps = {
  id?: number
  title: string
  author?: string
  coverColor?: string
  coverDataUrl?: string | null
  percentage?: number
  onOpen?: (id?: number) => void
  onDelete?: (id?: number) => void
  onRSVP?: (id?: number) => void
}

export default function BookCard({ id, title, author, coverColor = '#F4F4F1', coverDataUrl = null, percentage = 0, onOpen, onDelete, onRSVP }: BookCardProps){
  const initials = title.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()

  return (
    <motion.article
      layout
      transition={{ type: 'spring', stiffness: 1000, damping: 50 }}
      whileHover={{ y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 1000, damping: 50 } }}
      whileTap={{ scale: 0.98, transition: { type: 'spring', stiffness: 1000, damping: 50 } }}
      className="relative bg-white border-2 border-ink rounded-3xl overflow-hidden shadow-hard-stop p-3 flex flex-col items-start gap-3 allow-rubber"
      style={{ width: 220, aspectRatio: '3/4' }}
    >
      <div className="w-full h-40 rounded-2xl flex items-center justify-center" style={{ background: coverDataUrl ? `url(${coverDataUrl}) center/cover` : coverColor }}>
        {!coverDataUrl && (
          <div className="text-2xl font-rsvp text-ink">{initials}</div>
        )}
      </div>

      <div className="w-full flex-1 flex flex-col justify-between">
        <div>
          <div className="text-sm font-semibold text-ink truncate">{title}</div>
          {author && <div className="text-xs text-ink/60 mt-1">{author}</div>}
        </div>

        <div className="w-full flex items-center justify-between mt-3">
          <div className="text-xs text-ink/60">{Math.round(percentage)}%</div>

          {/* Progress ring */}
          <svg width="44" height="44" viewBox="0 0 42 42" className="ml-2">
            <defs>
              <linearGradient id={`g-${id}`} x1="0%" x2="100%">
                <stop offset="0%" stopColor="#FFDAB2" />
                <stop offset="100%" stopColor="#FF5C00" />
              </linearGradient>
            </defs>
            <g transform="translate(1 1)">
              <circle cx="20" cy="20" r="18" stroke="rgba(26,26,26,0.06)" strokeWidth="4" fill="none" />
              <circle cx="20" cy="20" r="18" stroke={`url(#g-${id})`} strokeWidth="4" strokeLinecap="round" fill="none"
                strokeDasharray={`${Math.PI * 2 * 18}`} strokeDashoffset={`${Math.PI * 2 * 18 * (1 - Math.min(1, percentage / 100))}`} transform="rotate(-90 20 20)" />
            </g>
          </svg>
        </div>
      </div>

      {/* context actions (visible on long-press / right click in real app) */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 motion-safe:group-hover:opacity-100">
        <button onClick={() => onRSVP?.(id)} className="w-8 h-8 rounded-squircle-md border-2 border-ink bg-white flex items-center justify-center">⚡</button>
        <button onClick={() => onOpen?.(id)} className="w-8 h-8 rounded-squircle-md border-2 border-ink bg-white flex items-center justify-center">📖</button>        <button onClick={() => navigator.clipboard?.writeText(`${location.origin}${location.pathname}?book=${id}&i=${Math.max(0, (Math.round((percentage/100)*1000) || 0))}`)} className="w-8 h-8 rounded-squircle-md border-2 border-ink bg-white flex items-center justify-center">🔗</button>        <button onClick={() => onDelete?.(id)} className="w-8 h-8 rounded-squircle-md border-2 border-ink bg-white flex items-center justify-center">🗑️</button>
      </div>
    </motion.article>
  )
}
