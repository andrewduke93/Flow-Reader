import React from 'react'

export default function FinishToast(){
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    function onFinish(){ setVisible(true); setTimeout(() => setVisible(false), 4500) }
    window.addEventListener('rsvp:finished', onFinish as EventListener)
    return () => window.removeEventListener('rsvp:finished', onFinish as EventListener)
  }, [])

  if (!visible) return null
  return (
    <div className="fixed right-4 top-16 z-50 bg-white border-2 border-ink rounded-squircle-md px-4 py-3 shadow-hard-stop flex items-start gap-3">
      <div className="w-10 h-10 rounded-squircle-md bg-mint flex items-center justify-center text-ink">✨</div>
      <div className="text-sm">
        <div className="font-semibold">The stream is yours now, man.</div>
        <div className="text-ink/60 text-xs">Keep it chill — Flowy will remember your spot.</div>
      </div>
    </div>
  )
}
