import { useEffect } from 'react';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initReveal(): IntersectionObserver | null {
  const elements = document.querySelectorAll('.reveal:not(.is-visible)');
  if (!elements.length) return null;

  if (prefersReducedMotion) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return null;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (inView) {
      el.classList.add('is-visible');
    } else {
      observer.observe(el);
    }
  });

  return observer;
}

/** Re-run when classic portfolio mounts (e.g. after leaving game mode). */
export function useReveal(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    let observer: IntersectionObserver | null = null;
    const frame = requestAnimationFrame(() => {
      observer = initReveal();
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [enabled]);
}
