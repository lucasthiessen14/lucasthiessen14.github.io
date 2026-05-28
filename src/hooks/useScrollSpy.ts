import { useEffect } from 'react';

const NAV_SECTIONS = ['about', 'experience', 'education', 'projects', 'skills', 'contact'];

export function useScrollSpy(): void {
  useEffect(() => {
    const progress = document.getElementById('scroll-progress');
    const navLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.site-nav__link[data-nav]'),
    );
    const sections = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    let rafId: number | null = null;
    let lastScrollTop = 0;

    function update() {
      rafId = null;
      const scrollTop = lastScrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progress && docHeight > 0) {
        const ratio = Math.min(1, Math.max(0, scrollTop / docHeight));
        progress.style.transform = `scaleX(${ratio})`;
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

    function onScroll() {
      lastScrollTop = window.scrollY || window.pageYOffset;
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);
}
