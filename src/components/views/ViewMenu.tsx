import { useEffect, useRef, useState } from 'react';
import ArticleIcon from '@mui/icons-material/Article';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import CommitIcon from '@mui/icons-material/Commit';
import DescriptionIcon from '@mui/icons-material/Description';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MapIcon from '@mui/icons-material/Map';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import StarIcon from '@mui/icons-material/Star';
import TerminalIcon from '@mui/icons-material/Terminal';
import { getViewLabel } from '../../config/views';
import { useToast } from '../../context/ToastContext';
import { useUiMode } from '../../context/UiModeContext';
import type { ViewId } from '../../types/views';

export const VIEW_ICONS: Partial<Record<ViewId, typeof DescriptionIcon>> = {
  classic: DescriptionIcon,
  game: MapIcon,
  plain: ArticleIcon,
  shell: TerminalIcon,
  log: CommitIcon,
  deck: SlideshowIcon,
  ide: CodeIcon,
};

type ViewMenuProps = {
  variant?: 'nav' | 'game';
};

export function ViewMenu({ variant = 'nav' }: ViewMenuProps) {
  const { mode, setMode, unlockedViews, defaultView, setDefaultView } = useUiMode();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isGame = variant === 'game';
  const CurrentIcon = VIEW_ICONS[mode] ?? DescriptionIcon;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (unlockedViews.length <= 1) return null;

  const onSwitch = (viewId: ViewId) => {
    setMode(viewId);
    setOpen(false);
  };

  const onSetDefault = (viewId: ViewId) => {
    setDefaultView(viewId);
    showToast(`${getViewLabel(viewId)} is now your default view.`);
    setOpen(false);
  };

  return (
    <div
      className={`view-menu-wrap${isGame ? ' view-menu-wrap--game' : ''}`}
      ref={rootRef}
    >
      <button
        type="button"
        className="view-menu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={`view-menu-panel-${variant}`}
        onClick={() => setOpen((value) => !value)}
      >
        <CurrentIcon className="view-menu__trigger-icon" aria-hidden />
        <span className="view-menu__trigger-label">{getViewLabel(mode)}</span>
        <ExpandMoreIcon className="view-menu__trigger-chevron" aria-hidden />
      </button>

      {open && (
        <div
          className="view-menu__panel"
          id={`view-menu-panel-${variant}`}
          role="menu"
          aria-label="Site views"
        >
          <p className="view-menu__section-label">Switch view</p>
          <ul className="view-menu__list">
            {unlockedViews.map((id) => {
              const Icon = VIEW_ICONS[id];
              const active = mode === id;
              return (
                <li key={`switch-${id}`}>
                  <button
                    type="button"
                    className={`view-menu__option${active ? ' is-active' : ''}`}
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => onSwitch(id)}
                  >
                    {Icon ? <Icon className="view-menu__option-icon" aria-hidden /> : null}
                    <span className="view-menu__option-label">{getViewLabel(id)}</span>
                    {active && <CheckIcon className="view-menu__option-check" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="view-menu__divider" role="separator" />

          <p className="view-menu__section-label">Default on visit</p>
          <ul className="view-menu__list">
            {unlockedViews.map((id) => {
              const Icon = VIEW_ICONS[id];
              const isDefault = defaultView === id;
              return (
                <li key={`default-${id}`}>
                  <button
                    type="button"
                    className={`view-menu__option view-menu__option--default${isDefault ? ' is-default' : ''}`}
                    role="menuitemradio"
                    aria-checked={isDefault}
                    onClick={() => onSetDefault(id)}
                  >
                    {Icon ? <Icon className="view-menu__option-icon" aria-hidden /> : null}
                    <span className="view-menu__option-label">{getViewLabel(id)}</span>
                    {isDefault ? (
                      <StarIcon className="view-menu__option-star" aria-hidden />
                    ) : (
                      <span className="view-menu__option-hint">Set default</span>
                    )}
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
