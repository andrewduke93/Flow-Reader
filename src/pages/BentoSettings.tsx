import React from 'react'
import SettingsCard from '../components/SettingsCard'
import { Cpu, Image, Target, Zap, Music } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import useRSVP from '../hooks/useRSVP'
import RSVPDisplay from '../components/RSVPDisplay'

const SAMPLE = 'Flow RSVP makes reading rhythmic, meditative, and fast — try the slider.'

export default function BentoSettings(){
  const s = useSettings()
  const rsvp = useRSVP(SAMPLE, { initialWpm: s.wpm })
  React.useEffect(() => { rsvp.setWpm(s.wpm) }, [s.wpm])
  React.useEffect(() => { /* pivot handled in preview prop */ }, [s.pivotPercent])

  return (
    <section className="py-6">
      <h2 className="text-2xl font-semibold mb-6">⚙️ Bento Settings</h2>

      <div className="bento-grid">
        {/* Large: The Engine */}
        <SettingsCard title="Engine" className="bento-card bento-card-large">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-squircle-md bg-white border-2 border-ink flex items-center justify-center"><Cpu /></div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="text-xs text-ink/60">WPM</div>
                <div className="flex-1">
                  <input aria-label="wpm-slider" type="range" min={100} max={1000} value={s.wpm} onChange={(e)=> s.set({ wpm: Number(e.target.value) })} />
                </div>
                <div className="w-14 text-right font-mono">{s.wpm}</div>
              </div>

              <div className="mt-4 bg-paper rounded-squircle-md p-3 border-2 border-ink">
                <RSVPDisplay words={rsvp.words} index={rsvp.currentWordIndex} wpm={s.wpm} isPlaying={false} pivotPercent={s.pivotPercent} />
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Medium: Visuals */}
        <SettingsCard title="Visuals" className="bento-card bento-card-med">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-squircle-md bg-white border-2 border-ink flex items-center justify-center"><Image /></div>
            <div className="flex-1">
              <div className="flex gap-2 items-center">
                <button onClick={() => s.set({ theme: 'paper' })} className={`rounded-squircle-md p-2 border-2 ${s.theme==='paper' ? 'border-safety' : 'border-ink'}`} aria-label="paper"><div style={{width:24,height:16,background:'#F4F4F1',borderRadius:6}} /></button>
                <button onClick={() => s.set({ theme: 'sepia' })} className={`rounded-squircle-md p-2 border-2 ${s.theme==='sepia' ? 'border-safety' : 'border-ink'}`} aria-label="sepia"><div style={{width:24,height:16,background:'#F5E9D6',borderRadius:6}} /></button>
                <button onClick={() => s.set({ theme: 'night' })} className={`rounded-squircle-md p-2 border-2 ${s.theme==='night' ? 'border-safety' : 'border-ink'}`} aria-label="night"><div style={{width:24,height:16,background:'#0B0B0B',borderRadius:6}} /></button>

                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => s.set({ font: 'ui' })} className={`rounded-squircle-md p-2 border-2 ${s.font==='ui' ? 'border-safety' : 'border-ink'}`} aria-label="sans">Aa</button>
                  <button onClick={() => s.set({ font: 'rsvp' })} className={`rounded-squircle-md p-2 border-2 ${s.font==='rsvp' ? 'border-safety' : 'border-ink'}`} aria-label="mono">M</button>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Medium: The Pivot */}
        <SettingsCard title="Pivot" className="bento-card bento-card-med">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-squircle-md bg-white border-2 border-ink flex items-center justify-center"><Target /></div>
            <div className="flex-1">
              <div className="w-full mt-1 relative">
                <input aria-label="pivot" className="w-full" type="range" min={0.25} max={0.45} step={0.01} value={s.pivotPercent} onChange={(e)=> s.set({ pivotPercent: Number(e.target.value) })} />
                <div className="pivot-sample mt-3 bg-paper rounded-squircle-md p-3 border-2 border-ink">
                  <div className="relative">
                    <div style={{height:44}}>
                      <RSVPDisplay words={["sample"]} index={0} pivotPercent={s.pivotPercent} />
                    </div>
                    <div style={{position:'absolute',left:`${s.pivotPercent*100}%`,top:0,transform:'translateX(-50%)'}} aria-hidden>
                      <div style={{width:2,height:44,background:'rgba(26,26,26,0.12)'}} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* Small toggles */}
        <SettingsCard title="Toggles" className="bento-card bento-card-small-grid">
          <div className="grid grid-cols-3 gap-3">
            <button aria-label="punctuation" onClick={() => s.set({ punctuationBreaths: !s.punctuationBreaths })} className={`rounded-squircle-md p-3 border-2 ${s.punctuationBreaths ? 'border-safety' : 'border-ink'}`}><Zap /></button>
            <button aria-label="longword" onClick={() => s.set({ longWordDelay: !s.longWordDelay })} className={`rounded-squircle-md p-3 border-2 ${s.longWordDelay ? 'border-safety' : 'border-ink'}`}><Zap /></button>
            <button aria-label="bionic" onClick={() => s.set({ bionicMode: !s.bionicMode })} className={`rounded-squircle-md p-3 border-2 ${s.bionicMode ? 'border-safety' : 'border-ink'}`}><Zap /></button>
          </div>
        </SettingsCard>

        {/* Flowy volume */}
        <SettingsCard title="Flowy" className="bento-card bento-card-small">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-squircle-md bg-white border-2 border-ink flex items-center justify-center"><Music /></div>
            <div className="flex-1">
              <input aria-label="flowy-volume" type="range" min={0} max={100} value={s.flowyVolume} onChange={(e)=> s.set({ flowyVolume: Number(e.target.value) })} />
            </div>
            <div className="w-14 text-right">{s.flowyVolume}%</div>
          </div>
        </SettingsCard>

      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={() => s.reset()} className="rounded-squircle-md border-2 border-ink px-3 py-2 bg-white">Reset</button>
        <div className="text-sm text-ink/60">Settings are saved locally and affect RSVP previews instantly.</div>
      </div>
    </section>
  )
}
