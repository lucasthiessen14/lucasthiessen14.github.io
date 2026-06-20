import { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUiMode } from '../context/UiModeContext';
import type { ViewId } from '../types/views';
import type { ColorTheme } from '../types/theme';
import { isDarkForcedView, isLightForcedView } from '../utils/viewModes';

function isForcedThemeView(mode: ViewId): boolean {
  return isLightForcedView(mode) || isDarkForcedView(mode);
}

function forcedThemeForView(mode: ViewId): ColorTheme {
  return isLightForcedView(mode) ? 'light' : 'dark';
}

export function useGameThemeSync(): void {
  const { theme, setTheme } = useTheme();
  const { mode } = useUiMode();
  const themeRef = useRef(theme);
  const savedTheme = useRef<ColorTheme | null>(null);
  const prevModeRef = useRef(mode);

  themeRef.current = theme;

  useEffect(() => {
    const prevMode = prevModeRef.current;
    prevModeRef.current = mode;

    const wasForced = isForcedThemeView(prevMode);
    const isForced = isForcedThemeView(mode);

    if (isForced && !wasForced) {
      savedTheme.current = themeRef.current;
    }

    if (!isForced && wasForced) {
      const restored = savedTheme.current ?? themeRef.current;
      savedTheme.current = null;
      document.documentElement.setAttribute('data-theme', restored);
      setTheme(restored);
      return;
    }

    if (isForced) {
      document.documentElement.setAttribute('data-theme', forcedThemeForView(mode));
    }
  }, [mode, setTheme]);
}
