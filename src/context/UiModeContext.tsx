import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { UiMode } from '../types/sections';

type UiModeContextValue = {
  mode: UiMode;
  setMode: (mode: UiMode) => void;
  toggleMode: () => void;
};

const UiModeContext = createContext<UiModeContextValue | null>(null);

function readStoredMode(): UiMode {
  return localStorage.getItem('uiMode') === 'game' ? 'game' : 'classic';
}

export function UiModeProvider({ children }: { children: ReactNode }) {
  // Always paint classic first so the page is never blank while React boots.
  const [mode, setModeState] = useState<UiMode>('classic');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    const stored = readStoredMode();
    if (stored === 'game') {
      setModeState('game');
    }
  }, []);

  const setMode = useCallback((next: UiMode) => {
    setModeState(next);
    document.documentElement.setAttribute('data-ui', next);
    localStorage.setItem('uiMode', next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'game' ? 'classic' : 'game');
  }, [mode, setMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-ui', mode);
    localStorage.setItem('uiMode', mode);
  }, [mode]);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, setMode, toggleMode],
  );

  return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
}

export function useUiMode(): UiModeContextValue {
  const ctx = useContext(UiModeContext);
  if (!ctx) throw new Error('useUiMode must be used within UiModeProvider');
  return ctx;
}
