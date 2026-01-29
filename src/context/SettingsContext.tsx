import React, { useContext, useState, useCallback, createContext, ReactNode } from 'react';

interface SettingsState {
  wpm: number
  pivotPercent: number
  punctuationBreaths: boolean
  longWordDelay: boolean
  bionicMode: boolean
  theme: 'paper' | 'sepia' | 'night'
  font: 'ui' | 'rsvp'
  flowyVolume: number // 0-100
  patchState: (patch: Partial<SettingsState>) => void
  reset: () => void
}

const DEFAULTS: Omit<SettingsState, 'patchState' | 'reset'> = {
  wpm: 420,
  pivotPercent: 0.35,
  punctuationBreaths: true,
  longWordDelay: true,
  bionicMode: true,
  theme: 'paper' as 'paper' | 'sepia' | 'night',
  font: 'rsvp' as 'ui' | 'rsvp',
  flowyVolume: 40
};

export const SettingsContext = createContext<SettingsState | undefined>(undefined);

export const useSettings = (): SettingsState => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState(DEFAULTS);

  const patchState = useCallback((patch: Partial<SettingsState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const reset = useCallback(() => setState(() => DEFAULTS), []);

  return (
    <SettingsContext.Provider value={{ ...state, patchState, reset }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const SettingsRoot: React.FC<{ children: ReactNode }> = ({ children }) => (
  <SettingsProvider>{children}</SettingsProvider>
);
