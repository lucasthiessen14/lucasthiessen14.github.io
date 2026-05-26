import { educationItems } from '../../data/portfolio';
import { SectionTitle } from './SectionTitle';

type EducationSectionProps = {
  variant?: 'page' | 'modal';
};

export function EducationSection({ variant = 'page' }: EducationSectionProps) {
  const inner = (
    <>
      {variant === 'page' && <SectionTitle number="03">Education</SectionTitle>}
      <div className="education-list">
        {educationItems.map((item) => (
          <article key={item.school} className="education-card reveal">
            <div className="education-card__header">
              <h3 className="education-card__school">{item.school}</h3>
              <span className="education-card__date">{item.date}</span>
            </div>
            <p className="education-card__degree">{item.degree}</p>
            <p className="education-card__detail">{item.detail}</p>
          </article>
        ))}
      </div>
    </>
  );

  if (variant === 'modal') {
    return <div className="container">{inner}</div>;
  }

  return (
    <section className="section" id="education">
      <div className="container">{inner}</div>
    </section>
  );
}
