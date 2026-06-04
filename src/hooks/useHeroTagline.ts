import { useEffect, useRef, useState } from 'react';

const HERO_ROLES = [
  'Computer Engineering Graduate',
  'Embedded Systems Engineer',
  'Robotics & C++ Developer',
  'Full-Stack Developer',
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROLE_ANIM_MS = 420;

export function useHeroTagline(): { role: string; isAnimating: boolean } {
  const [role, setRole] = useState(HERO_ROLES[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (prefersReducedMotion || HERO_ROLES.length < 2) return;

    const interval = window.setInterval(() => {
      setIsAnimating(true);
      window.clearTimeout(animTimer.current);
      animTimer.current = window.setTimeout(() => {
        setRole((current) => {
          const idx = HERO_ROLES.indexOf(current);
          return HERO_ROLES[(idx + 1) % HERO_ROLES.length];
        });
        setIsAnimating(false);
      }, ROLE_ANIM_MS);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(animTimer.current);
    };
  }, []);

  return { role, isAnimating };
}
