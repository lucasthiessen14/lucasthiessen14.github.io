import { useState } from 'react';
import { projects, type ProjectItem } from '../../data/portfolio';
import { scrollToSelector } from '../../utils/scroll';
import { SectionTitle } from './SectionTitle';

type ProjectsSectionProps = {
  variant?: 'page' | 'modal';
};

function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <article
      className={`project-card${project.featured ? ' project-card--featured' : ''} reveal`}
    >
      <div className="project-card__body">
        <p className="project-card__meta">{project.meta}</p>
        <h3 className="project-card__title">{project.title}</h3>
        <div className="project-card__tags">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <ul className="project-card__desc">
          {project.bullets.map((bullet) => (
            <li key={bullet.slice(0, 48)}>{bullet}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export function ProjectsSection({ variant = 'page' }: ProjectsSectionProps) {
  const showAll = variant === 'modal';
  const [expanded, setExpanded] = useState(false);

  const featured = projects.filter((p) => p.featured);
  const extra = projects.filter((p) => !p.featured);

  const inner = showAll ? (
    <>
      <div className="projects__grid">
        {featured.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>
      <div className="projects__more">
        {extra.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>
    </>
  ) : (
    <>
      <SectionTitle number="04">Featured Projects</SectionTitle>
      <div className="projects__grid">
        {featured.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>
      <div className="projects__more" hidden={!expanded}>
        {extra.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>
      <div className="projects__actions">
        <button
          type="button"
          className="btn btn--ghost"
          aria-expanded={expanded}
          onClick={() => {
            const opening = !expanded;
            setExpanded(opening);
            if (!opening) scrollToSelector('#projects');
          }}
        >
          {expanded ? 'View Less Projects' : 'View More Projects'}
        </button>
      </div>
    </>
  );

  if (variant === 'modal') {
    return <div className="container">{inner}</div>;
  }

  return (
    <section className="section section--alt" id="projects">
      <div className="container">{inner}</div>
    </section>
  );
}
