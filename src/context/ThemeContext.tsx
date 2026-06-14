import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { COLOR_THEME_STORAGE_KEY, type ColorTheme } from '../types/theme';

type ThemeContextValue = {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function readStoredTheme(): ColorTheme {
  return localStorage.getItem(COLOR_THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

function syncTheme(theme: ColorTheme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function persistTheme(theme: ColorTheme) {
  if (theme === 'light') {
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, 'light');
  } else {
    localStorage.removeItem(COLOR_THEME_STORAGE_KEY);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>(() => readStoredTheme());

  useEffect(() => {
    syncTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ColorTheme) => {
    setThemeState(next);
    persistTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      persistTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
