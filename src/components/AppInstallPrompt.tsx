import React from 'react'

export default function AppInstallPrompt(){
  const [deferred, setDeferred] = React.useState<any>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    function onBefore(e: any){
      e.preventDefault()
      setDeferred(e)
      // don't show immediately — wait for reading milestone
    }
    window.addEventListener('beforeinstallprompt', onBefore)
    function onWords(e: any){
      try {
        const n = e.detail?.wordsRead ?? 0
        if (n >= 500 && deferred) setVisible(true)
      } catch (err) {}
    }
    window.addEventListener('rsvp:wordsRead', onWords as EventListener)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore)
      window.removeEventListener('rsvp:wordsRead', onWords as EventListener)
    }
  }, [deferred])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-ink rounded-squircle-md px-4 py-3 shadow-hard-stop flex items-center gap-3">
      <div className="w-10 h-10 rounded-squircle-md bg-safety flex items-center justify-center text-white">🌊</div>
      <div className="text-sm">
        <div className="font-semibold">Keep Flowy on your home screen?</div>
        <div className="text-ink/60 text-xs">Install for distraction-free reading and offline freedom.</div>
      </div>
      <div className="ml-4 flex gap-2">
        <button className="rounded-squircle-md border-2 border-ink px-3 py-1 bg-white" onClick={() => setVisible(false)}>Not now</button>
        <button className="rounded-squircle-md border-2 border-safety bg-safety text-white px-3 py-1" onClick={async () => {
          try {
            setVisible(false)
            if (deferred) {
              deferred.prompt()
              const choice = await deferred.userChoice
              if (choice?.outcome === 'accepted') console.log('installed')
            }
          } catch (err) { console.error(err) }
        }}>Install</button>
      </div>
    </div>
  )
}
