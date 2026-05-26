export const SECTION_IDS = [
  'hero',
  'about',
  'experience',
  'education',
  'projects',
  'skills',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: 'Home',
  about: 'About Me',
  experience: 'Experience',
  education: 'Education',
  projects: 'Featured Projects',
  skills: 'Skills',
  contact: 'Get in Touch',
};

export const SECTION_SHORT: Record<SectionId, string> = {
  hero: 'Home',
  about: 'About',
  experience: 'Work',
  education: 'School',
  projects: 'Projects',
  skills: 'Skills',
  contact: 'Contact',
};

export type UiMode = 'classic' | 'game';

export type Direction = { dr: number; dc: number };

export type CellPos = { row: number; col: number };
