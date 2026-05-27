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
  const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'dark';
}

function applyTheme(theme: ColorTheme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ColorTheme>(() => readStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ColorTheme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
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
