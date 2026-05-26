import { useEffect } from 'react';

const NAV_SECTIONS = ['about', 'experience', 'education', 'projects', 'skills', 'contact'];

export function useScrollSpy(): void {
  useEffect(() => {
    const progress = document.getElementById('scroll-progress');
    const navLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.site-nav__link[data-nav]'),
    );
    const sections = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);

    function onScroll() {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progress && docHeight > 0) {
        progress.style.width = `${(scrollTop / docHeight) * 100}%`;
      }

      let current: string | null = null;
      const navOffset = 120;
      sections.forEach((section) => {
        if (section && section.offsetTop - navOffset <= scrollTop) {
          current = section.id;
        }
      });

      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${current}`;
        link.classList.toggle('is-active', active);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
