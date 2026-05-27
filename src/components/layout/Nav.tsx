import type { MouseEvent } from 'react';
import MapIcon from '@mui/icons-material/Map';
import DescriptionIcon from '@mui/icons-material/Description';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '../../context/ThemeContext';
import { useUiMode } from '../../context/UiModeContext';
import { scrollToSelector } from '../../utils/scroll';

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#education', label: 'Education' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
];

export function Nav() {
  const { theme, toggleTheme } = useTheme();
  const { mode, toggleMode, gameModeEnabled } = useUiMode();

  const closeNav = () => {
    document.body.classList.remove('nav-open');
    const panel = document.getElementById('nav-panel');
    const toggle = document.getElementById('nav-toggle');
    panel?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  };

  const onNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToSelector(href);
    closeNav();
  };

  return (
    <nav className="site-nav" aria-label="Main">
      <div className="site-nav__inner">
        <a
          href="#hero"
          className="site-nav__logo"
          onClick={(e) => onNavClick(e, '#hero')}
        >
          LT
        </a>
        <div className="site-nav__panel" id="nav-panel">
          <ul className="site-nav__links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="site-nav__link"
                  data-nav
                  onClick={(e) => onNavClick(e, link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="site-nav__actions">
          <button
            type="button"
            className="nav-icon-btn theme-toggle"
            id="theme-toggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <LightModeIcon aria-hidden />
            ) : (
              <DarkModeIcon aria-hidden />
            )}
          </button>
          {gameModeEnabled && (
            <button
              type="button"
              className="nav-icon-btn ui-mode-toggle"
              id="ui-mode-toggle"
              aria-pressed={mode === 'game'}
              aria-label={
                mode === 'game' ? 'Switch to classic portfolio' : 'Switch to adventure map'
              }
              onClick={toggleMode}
            >
              <MapIcon className="icon-map" aria-hidden />
              <DescriptionIcon className="icon-doc" aria-hidden />
            </button>
          )}
          <button
            type="button"
            className="nav-toggle"
            id="nav-toggle"
            aria-expanded="false"
            aria-controls="nav-panel"
            aria-label="Open menu"
            onClick={() => {
              const panel = document.getElementById('nav-panel');
              const toggle = document.getElementById('nav-toggle');
              if (!panel || !toggle) return;
              const open = panel.classList.toggle('is-open');
              document.body.classList.toggle('nav-open', open);
              toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            }}
          >
            <MenuIcon aria-hidden />
          </button>
        </div>
      </div>
    </nav>
  );
}
