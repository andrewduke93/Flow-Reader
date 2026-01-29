import React from 'react'

export default function SettingsCard({ children, title, className }: { children: React.ReactNode; title?: string; className?: string }){
  return (
    <div role="group" aria-label={title} className={`rounded-3xl border-2 border-ink bg-white shadow-hard-stop p-4 ${className ?? ''}`}>
      {children}
    </div>
  )
}
