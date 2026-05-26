import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import BuildIcon from '@mui/icons-material/Build';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import type { SvgIconComponent } from '@mui/icons-material';
import type { SectionId } from '../../types/sections';

const SECTION_ICONS: Record<SectionId, SvgIconComponent> = {
  hero: HomeIcon,
  about: PersonIcon,
  experience: WorkIcon,
  education: SchoolIcon,
  projects: FolderSpecialIcon,
  skills: BuildIcon,
  contact: MailOutlineIcon,
};

type Props = {
  sectionId: SectionId;
};

export function SectionMarkerIcon({ sectionId }: Props) {
  const Icon = SECTION_ICONS[sectionId];
  return <Icon className="game-mode__section-icon" fontSize="inherit" />;
}
