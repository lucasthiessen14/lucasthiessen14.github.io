import type { SectionId } from '../../types/sections';
import { AboutSection } from './AboutSection';
import { ContactSection } from './ContactSection';
import { EducationSection } from './EducationSection';
import { ExperienceSection } from './ExperienceSection';
import { HeroSection } from './HeroSection';
import { ProjectsSection } from './ProjectsSection';
import { SkillsSection } from './SkillsSection';

type SectionPanelProps = {
  sectionId: SectionId;
  variant: 'page' | 'modal';
};

export function SectionPanel({ sectionId, variant }: SectionPanelProps) {
  switch (sectionId) {
    case 'hero':
      return <HeroSection variant={variant} />;
    case 'about':
      return <AboutSection variant={variant} />;
    case 'experience':
      return <ExperienceSection variant={variant} />;
    case 'education':
      return <EducationSection variant={variant} />;
    case 'projects':
      return <ProjectsSection variant={variant} />;
    case 'skills':
      return <SkillsSection variant={variant} />;
    case 'contact':
      return <ContactSection variant={variant} />;
    default:
      return null;
  }
}
