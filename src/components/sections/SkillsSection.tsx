import { skillsGroups } from '../../data/portfolio';
import { SectionTitle } from './SectionTitle';

type SkillsSectionProps = {
  variant?: 'page' | 'modal';
};

export function SkillsSection({ variant = 'page' }: SkillsSectionProps) {
  const inner = (
    <>
      {variant === 'page' && <SectionTitle number="05">Skills</SectionTitle>}
      <div className="skills-grid">
        {skillsGroups.map((group) => (
          <div key={group.label} className="skills-group reveal">
            <h3 className="skills-group__label">{group.label}</h3>
            <ul className="skills-group__list">
              {group.items.map((item) => (
                <li key={item} className="skills-group__item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );

  if (variant === 'modal') {
    return <div className="container">{inner}</div>;
  }

  return (
    <section className="section" id="skills">
      <div className="container">{inner}</div>
    </section>
  );
}
