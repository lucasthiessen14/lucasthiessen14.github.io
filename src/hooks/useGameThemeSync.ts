import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiMode } from '../context/UiModeContext';
import type { ColorTheme } from '../types/theme';

export function useGameThemeSync(): void {
  const { theme, setTheme } = useTheme();
  const { mode } = useUiMode();
  const savedTheme = useRef<ColorTheme | null>(null);

  useEffect(() => {
    if (mode === 'game' || mode === 'plain') {
      if (savedTheme.current === null) {
        savedTheme.current = theme;
      }
      document.documentElement.setAttribute('data-theme', mode === 'game' ? 'dark' : 'light');
      return;
    }

    if (savedTheme.current !== null) {
      setTheme(savedTheme.current);
      savedTheme.current = null;
    }
  }, [mode, setTheme, theme]);
}
