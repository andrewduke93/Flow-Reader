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

const NOOP = () => {};

export const SAFE_DEFAULT: SettingsState = {
  ...DEFAULTS,
  patchState: (patch: Partial<SettingsState>) => NOOP(),
  reset: () => NOOP(),
};

export const SettingsContext = createContext<SettingsState>(SAFE_DEFAULT);

export const useSettings = (): SettingsState => {
  const context = useContext(SettingsContext);
  if (!context) {
    // Fallback for mismatched bundles or missing provider in deployed code.
    // Log once and return a safe default to avoid hard crashes in production.
    // eslint-disable-next-line no-console
    console.warn('useSettings used outside SettingsProvider — using safe defaults');
    return SAFE_DEFAULT;
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
