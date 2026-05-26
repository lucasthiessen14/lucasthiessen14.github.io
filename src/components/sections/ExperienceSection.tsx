import { experienceItems } from '../../data/portfolio';
import { SectionTitle } from './SectionTitle';

type ExperienceSectionProps = {
  variant?: 'page' | 'modal';
};

export function ExperienceSection({ variant = 'page' }: ExperienceSectionProps) {
  const inner = (
    <>
      {variant === 'page' && <SectionTitle number="02">Experience</SectionTitle>}
      <div className="experience-list">
        {experienceItems.map((item) => (
          <article key={`${item.company}-${item.date}`} className="experience-card reveal">
            <p className="experience-card__date">{item.date}</p>
            <h3 className="experience-card__company">{item.company}</h3>
            <p className="experience-card__role">{item.role}</p>
            <ul className="experience-card__bullets">
              {item.bullets.map((bullet) => (
                <li key={bullet.slice(0, 40)}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  );

  if (variant === 'modal') {
    return <div className="container">{inner}</div>;
  }

  return (
    <section className="section section--alt" id="experience">
      <div className="container">{inner}</div>
    </section>
  );
}
