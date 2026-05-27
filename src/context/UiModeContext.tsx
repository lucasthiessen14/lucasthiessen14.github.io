import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { GAME_MODE_ENABLED } from '../config/features';
import type { UiMode } from '../types/sections';

type UiModeContextValue = {
  mode: UiMode;
  setMode: (mode: UiMode) => void;
  toggleMode: () => void;
  gameModeEnabled: boolean;
};

const UiModeContext = createContext<UiModeContextValue | null>(null);

function readStoredMode(): UiMode {
  return localStorage.getItem('uiMode') === 'game' ? 'game' : 'classic';
}

export function UiModeProvider({ children }: { children: ReactNode }) {
  // Always paint classic first so the page is never blank while React boots.
  const [mode, setModeState] = useState<UiMode>('classic');

  useEffect(() => {
    if (!GAME_MODE_ENABLED) {
      if (readStoredMode() === 'game') {
        localStorage.setItem('uiMode', 'classic');
      }
      return;
    }
    const stored = readStoredMode();
    if (stored === 'game') {
      setModeState('game');
    }
  }, []);

  const setMode = useCallback((next: UiMode) => {
    const resolved = next === 'game' && !GAME_MODE_ENABLED ? 'classic' : next;
    setModeState(resolved);
    document.documentElement.setAttribute('data-ui', resolved);
    localStorage.setItem('uiMode', resolved);
  }, []);

  const toggleMode = useCallback(() => {
    if (!GAME_MODE_ENABLED) return;
    setMode(mode === 'game' ? 'classic' : 'game');
  }, [mode, setMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-ui', mode);
    localStorage.setItem('uiMode', mode);
  }, [mode]);

  const value = useMemo(
    () => ({ mode, setMode, toggleMode, gameModeEnabled: GAME_MODE_ENABLED }),
    [mode, setMode, toggleMode],
  );

  return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
}

export function useUiMode(): UiModeContextValue {
  const ctx = useContext(UiModeContext);
  if (!ctx) throw new Error('useUiMode must be used within UiModeProvider');
  return ctx;
}
