import React from 'react'

type Props = { children: React.ReactNode }

export default function GlobalLayout({ children }: Props){
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 bg-paper text-ink font-ui" style={{boxSizing: 'border-box'}}>
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
