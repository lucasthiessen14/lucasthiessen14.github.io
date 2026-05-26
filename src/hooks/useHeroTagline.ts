import { useEffect, useState } from 'react';

const HERO_ROLES = [
  'Computer Engineering Graduate',
  'Embedded Systems Engineer',
  'Robotics & C++ Developer',
  'Full-Stack Developer',
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useHeroTagline(): string {
  const [role, setRole] = useState(HERO_ROLES[0]);
  useEffect(() => {
    if (prefersReducedMotion || HERO_ROLES.length < 2) return;

    const interval = window.setInterval(() => {
      setRole((current) => {
        const idx = HERO_ROLES.indexOf(current);
        return HERO_ROLES[(idx + 1) % HERO_ROLES.length];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return role;
}
