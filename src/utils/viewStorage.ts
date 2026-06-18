import { BASE_VIEWS } from '../config/views';
import type { ViewId } from '../types/views';

const DISCOVERED_KEY = 'discoveredViews';
const DEFAULT_VIEW_KEY = 'defaultView';
const UI_MODE_KEY = 'uiMode';

function isViewId(value: string): value is ViewId {
  return value === 'classic' || value === 'game';
}

export function readDiscoveredViews(): ViewId[] {
  try {
    const raw = localStorage.getItem(DISCOVERED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is ViewId => typeof id === 'string' && isViewId(id));
  } catch {
    return [];
  }
}

export function writeDiscoveredViews(views: ViewId[]): void {
  localStorage.setItem(DISCOVERED_KEY, JSON.stringify(views));
}

export function readDefaultView(): ViewId {
  const stored = localStorage.getItem(DEFAULT_VIEW_KEY);
  return stored && isViewId(stored) ? stored : 'classic';
}

export function writeDefaultView(view: ViewId): void {
  localStorage.setItem(DEFAULT_VIEW_KEY, view);
}

export function readStoredMode(): ViewId {
  const stored = localStorage.getItem(UI_MODE_KEY);
  return stored && isViewId(stored) ? stored : 'classic';
}

export function writeStoredMode(mode: ViewId): void {
  localStorage.setItem(UI_MODE_KEY, mode);
}

export function isViewUnlocked(id: ViewId, discovered: ViewId[]): boolean {
  return BASE_VIEWS.includes(id) || discovered.includes(id);
}

export function readInitialMode(discovered: ViewId[]): ViewId {
  const defaultView = readDefaultView();
  if (isViewUnlocked(defaultView, discovered)) {
    return defaultView;
  }

  const stored = readStoredMode();
  if (isViewUnlocked(stored, discovered)) {
    return stored;
  }

  return 'classic';
}
