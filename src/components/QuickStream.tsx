import React from 'react'
import { motion } from 'framer-motion'
import RSVPDisplay from './RSVPDisplay'

type Props = {
  words: string[]
  index?: number
  anchor: { x: number; y: number }
  onClose?: () => void
}

export default function QuickStream({ words, index = 0, anchor, onClose }: Props){
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 1000, damping: 50 }}
      style={{ position: 'fixed', left: anchor.x, top: anchor.y, transform: 'translate(-50%, -120%)', zIndex: 60 }}
      className="w-44 rounded-3xl bg-white border-2 border-ink p-3 shadow-hard-stop"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="text-xs text-ink/60 mb-2">Quick Stream</div>
      <div>
        <RSVPDisplay words={words} index={index} pivotPercent={0.5} isPlaying={true} wpm={600} />
      </div>
      <div className="mt-2 text-right">
        <button onClick={onClose} className="text-xs text-ink/60">Close</button>
      </div>
    </motion.div>
  )
}
