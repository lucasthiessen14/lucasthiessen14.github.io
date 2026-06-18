import { useEffect, useRef, useState } from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import MapIcon from '@mui/icons-material/Map';
import TuneIcon from '@mui/icons-material/Tune';
import { getViewLabel } from '../../config/views';
import { useToast } from '../../context/ToastContext';
import { useUiMode } from '../../context/UiModeContext';
import type { ViewId } from '../../types/views';

const VIEW_ICONS: Partial<Record<ViewId, typeof DescriptionIcon>> = {
  classic: DescriptionIcon,
  game: MapIcon,
};

export function ViewSwitcher() {
  const { mode, setMode, unlockedViews, defaultView, setDefaultView, alternateViewsEnabled } =
    useUiMode();
  const { showToast } = useToast();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!prefsOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPrefsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPrefsOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [prefsOpen]);

  if (!alternateViewsEnabled || unlockedViews.length <= 1) return null;

  const onDefaultChange = (viewId: ViewId) => {
    setDefaultView(viewId);
    showToast(`${getViewLabel(viewId)} is now your default view.`);
    setPrefsOpen(false);
  };

  return (
    <div className="view-switcher-wrap" ref={rootRef}>
      <div className="view-switcher" role="group" aria-label="Site view">
        {unlockedViews.map((id) => {
          const Icon = VIEW_ICONS[id];
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              className={`view-switcher__btn${active ? ' is-active' : ''}`}
              aria-pressed={active}
              aria-label={getViewLabel(id)}
              title={getViewLabel(id)}
              onClick={() => setMode(id)}
            >
              {Icon ? <Icon aria-hidden /> : getViewLabel(id)}
            </button>
          );
        })}
        <button
          type="button"
          className={`view-switcher__btn view-switcher__btn--prefs${prefsOpen ? ' is-active' : ''}`}
          aria-expanded={prefsOpen}
          aria-haspopup="dialog"
          aria-controls="view-switcher-prefs"
          aria-label="View preferences"
          title="View preferences"
          onClick={() => setPrefsOpen((open) => !open)}
        >
          <TuneIcon aria-hidden />
        </button>
      </div>

      {prefsOpen && (
        <div
          className="view-switcher__prefs"
          id="view-switcher-prefs"
          role="dialog"
          aria-label="Default view"
        >
          <p className="view-switcher__prefs-label">Default view on visit</p>
          <ul className="view-switcher__prefs-list">
            {unlockedViews.map((id) => {
              const Icon = VIEW_ICONS[id];
              const isDefault = defaultView === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`view-switcher__prefs-option${isDefault ? ' is-default' : ''}`}
                    aria-pressed={isDefault}
                    onClick={() => onDefaultChange(id)}
                  >
                    {Icon ? <Icon className="view-switcher__prefs-icon" aria-hidden /> : null}
                    <span>{getViewLabel(id)}</span>
                    {isDefault && <span className="view-switcher__prefs-check" aria-hidden>✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
