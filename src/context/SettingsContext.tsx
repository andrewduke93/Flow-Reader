import React from 'react'

export type VisualTheme = 'paper' | 'sepia' | 'night'

export type SettingsState = {
  wpm: number
  pivotPercent: number
  punctuationBreaths: boolean
  longWordDelay: boolean
  bionicMode: boolean
  theme: VisualTheme
  font: 'ui' | 'rsvp'
  flowyVolume: number // 0-100
  set: (patch: Partial<SettingsState>) => void
  reset: () => void
}

const DEFAULTS = {
  wpm: 420,
  pivotPercent: 0.35,
  punctuationBreaths: true,
  longWordDelay: true,
  bionicMode: true,
  theme: 'paper' as VisualTheme,
  font: 'rsvp' as 'ui' | 'rsvp',
  flowyVolume: 40
}

const SettingsContext = React.createContext<SettingsState | undefined>(undefined)

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = React.useState<SettingsState>(() => {
    try {
      const raw = localStorage.getItem('flowy:settings')
      if (raw) return { ...(JSON.parse(raw) as any), set: () => {}, reset: () => {} } as SettingsState
    } catch (err) {}
    return { ...(DEFAULTS as any), set: () => {}, reset: () => {} } as SettingsState
  })

  React.useEffect(() => {
    const payload = { ...state }
    // don't persist functions
    delete (payload as any).set
    delete (payload as any).reset
    try { localStorage.setItem('flowy:settings', JSON.stringify(payload)) } catch (err) {}
  }, [state.wpm, state.pivotPercent, state.punctuationBreaths, state.longWordDelay, state.bionicMode, state.theme, state.font, state.flowyVolume])

  const set = React.useCallback((patch: Partial<SettingsState>) => {
    setState(s => ({ ...s, ...patch }))
  }, [])
  const reset = React.useCallback(() => setState(s => ({ ...s, ...DEFAULTS } as any)), [])

  const value = React.useMemo(() => ({ ...state, set, reset }), [state, set, reset])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(){
  const ctx = React.useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export const SettingsRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>{children}</SettingsProvider>
)
