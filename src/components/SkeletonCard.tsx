import React from 'react'

export default function SkeletonCard(){
  return (
    <div className="animate-pulse bg-white border-2 border-ink/6 rounded-3xl p-4 w-56 h-[296px] flex flex-col gap-3">
      <div className="bg-ink/6 rounded-2xl h-40 w-full" />
      <div className="h-4 bg-ink/6 rounded w-3/4" />
      <div className="h-3 bg-ink/6 rounded w-1/2 mt-2" />
      <div className="mt-auto flex items-center justify-between">
        <div className="h-8 w-20 bg-ink/6 rounded" />
        <div className="h-8 w-8 bg-ink/6 rounded" />
      </div>
    </div>
  )
}
