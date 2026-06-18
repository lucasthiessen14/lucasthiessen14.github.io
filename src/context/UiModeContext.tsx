import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { BASE_VIEWS, findDiscoverableView, type DiscoverableView } from '../config/views';
import { useAlternateViewsEnabled } from '../hooks/useAlternateViewsEnabled';
import type { ViewId } from '../types/views';
import {
  isViewUnlocked,
  readDefaultView,
  readDiscoveredViews,
  readInitialMode,
  writeDefaultView,
  writeDiscoveredViews,
  writeStoredMode,
} from '../utils/viewStorage';

type UiModeContextValue = {
  /** Active presentation mode (classic on mobile). */
  mode: ViewId;
  setMode: (mode: ViewId) => void;
  unlockedViews: ViewId[];
  isViewUnlocked: (id: ViewId) => boolean;
  defaultView: ViewId;
  setDefaultView: (view: ViewId) => void;
  pendingUnlock: DiscoverableView | null;
  resolveUnlock: (setAsDefault: boolean) => void;
  /** Whether alternate views can be entered (desktop only). */
  alternateViewsEnabled: boolean;
};

const UiModeContext = createContext<UiModeContextValue | null>(null);

function stripUnlockParam(view: DiscoverableView): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(view.urlParam)) return;
  url.searchParams.delete(view.urlParam);
  const next = url.pathname + url.search + url.hash;
  window.history.replaceState({}, '', next);
}

export function UiModeProvider({ children }: { children: ReactNode }) {
  const alternateViewsEnabled = useAlternateViewsEnabled();
  const [discoveredViews, setDiscoveredViews] = useState<ViewId[]>(() => readDiscoveredViews());
  const [defaultView, setDefaultViewState] = useState<ViewId>(() => readDefaultView());
  const [mode, setModeState] = useState<ViewId>('classic');
  const [pendingUnlock, setPendingUnlock] = useState<DiscoverableView | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const urlCheckedRef = useRef(false);

  const activeMode: ViewId = alternateViewsEnabled ? mode : 'classic';

  const unlockedViews = useMemo(
    () => [...new Set<ViewId>([...BASE_VIEWS, ...discoveredViews])],
    [discoveredViews],
  );

  const checkUnlocked = useCallback(
    (id: ViewId) => isViewUnlocked(id, discoveredViews),
    [discoveredViews],
  );

  const setMode = useCallback(
    (next: ViewId) => {
      if (!isViewUnlocked(next, discoveredViews)) return;
      if (!alternateViewsEnabled && next !== 'classic') return;
      setModeState(next);
      writeStoredMode(next);
      document.documentElement.setAttribute('data-ui', next);
    },
    [discoveredViews, alternateViewsEnabled],
  );

  const setDefaultView = useCallback(
    (view: ViewId) => {
      if (!isViewUnlocked(view, discoveredViews)) return;
      setDefaultViewState(view);
      writeDefaultView(view);
    },
    [discoveredViews],
  );

  const resolveUnlock = useCallback(
    (setAsDefault: boolean) => {
      if (!pendingUnlock) return;
      if (setAsDefault) {
        setDefaultView(pendingUnlock.id);
      }
      setPendingUnlock(null);
    },
    [pendingUnlock, setDefaultView],
  );

  useEffect(() => {
    const discovered = readDiscoveredViews();
    const preferred = readInitialMode(discovered);
    setDiscoveredViews(discovered);
    setDefaultViewState(readDefaultView());
    setModeState(preferred);
    document.documentElement.setAttribute(
      'data-ui',
      alternateViewsEnabled ? preferred : 'classic',
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute('data-ui', activeMode);
    if (alternateViewsEnabled) {
      writeStoredMode(mode);
    }
  }, [mode, activeMode, hydrated, alternateViewsEnabled]);

  useEffect(() => {
    if (!hydrated || urlCheckedRef.current) return;
    urlCheckedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const match = findDiscoverableView(params);
    if (!match) return;

    stripUnlockParam(match);

    setDiscoveredViews((prev) => {
      if (prev.includes(match.id)) return prev;
      const next = [...prev, match.id];
      writeDiscoveredViews(next);
      setPendingUnlock(match);
      return next;
    });

    if (alternateViewsEnabled) {
      setModeState(match.id);
      writeStoredMode(match.id);
      document.documentElement.setAttribute('data-ui', match.id);
    }
  }, [hydrated, alternateViewsEnabled]);

  const value = useMemo(
    () => ({
      mode: activeMode,
      setMode,
      unlockedViews,
      isViewUnlocked: checkUnlocked,
      defaultView,
      setDefaultView,
      pendingUnlock,
      resolveUnlock,
      alternateViewsEnabled,
    }),
    [
      activeMode,
      setMode,
      unlockedViews,
      checkUnlocked,
      defaultView,
      setDefaultView,
      pendingUnlock,
      resolveUnlock,
      alternateViewsEnabled,
    ],
  );

  return <UiModeContext.Provider value={value}>{children}</UiModeContext.Provider>;
}

export function useUiMode(): UiModeContextValue {
  const ctx = useContext(UiModeContext);
  if (!ctx) throw new Error('useUiMode must be used within UiModeProvider');
  return ctx;
}
