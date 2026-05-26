const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let scrollAnimId: number | null = null;

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function scrollToY(targetY: number): void {
  if (prefersReducedMotion) {
    window.scrollTo(0, targetY);
    return;
  }

  if (scrollAnimId) cancelAnimationFrame(scrollAnimId);

  const startY = window.pageYOffset;
  const distance = Math.abs(targetY - startY);
  const duration = Math.min(1100, Math.max(650, distance * 0.5));
  let startTime: number | null = null;

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutQuad(progress);
    window.scrollTo(0, startY + (targetY - startY) * eased);

    if (progress < 1) {
      scrollAnimId = requestAnimationFrame(step);
    } else {
      scrollAnimId = null;
    }
  }

  scrollAnimId = requestAnimationFrame(step);
}

export function scrollToSelector(selector: string): void {
  const el = document.querySelector(selector);
  if (!el) return;
  const navHeight =
    parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10) || 64;
  scrollToY(el.getBoundingClientRect().top + window.pageYOffset - navHeight + 1);
}

export function scrollToSection(sectionId: string): void {
  scrollToSelector(`#${sectionId}`);
}
