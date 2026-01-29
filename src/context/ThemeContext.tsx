import React from 'react'

type Theme = 'paper' | 'paper-dark'

type ThemeContextShape = {
  theme: Theme
  toggleTheme: () => void
  reduceMotion: boolean
}

const ThemeContext = React.createContext<ThemeContextShape | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [theme, setTheme] = React.useState<Theme>('paper')
  const [reduceMotion] = React.useState<boolean>(prefersReduced)

  const toggleTheme = React.useCallback(() => setTheme(t => (t === 'paper' ? 'paper-dark' : 'paper')), [])

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (reduceMotion) document.documentElement.classList.add('reduced-motion')
    else document.documentElement.classList.remove('reduced-motion')
  }, [theme, reduceMotion])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, reduceMotion }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(){
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
