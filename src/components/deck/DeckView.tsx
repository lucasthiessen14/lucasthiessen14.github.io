import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  aboutParagraphs,
  getAge,
  portfolioMeta,
} from '../../data/portfolioContent';
import {
  educationItems,
  experienceItems,
  projects,
  skillsGroups,
} from '../../data/portfolio';
import { AlternateViewHeader } from '../views/AlternateViewHeader';

type Slide = {
  id: string;
  label: string;
  content: ReactNode;
};

function buildSlides(): Slide[] {
  const age = getAge();

  return [
    {
      id: 'intro',
      label: 'Intro',
      content: (
        <>
          <p className="deck-view__eyebrow">{portfolioMeta.title}</p>
          <h2 className="deck-view__heading">{portfolioMeta.name}</h2>
          <p className="deck-view__lead">{portfolioMeta.subtitle}</p>
          <p className="deck-view__links">
            <a href={portfolioMeta.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {' · '}
            <a href={portfolioMeta.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </p>
        </>
      ),
    },
    {
      id: 'about',
      label: 'About',
      content: (
        <>
          <h2 className="deck-view__heading">About Me</h2>
          <p className="deck-view__meta">
            University of Waterloo · Computer Engineering · Age {age}
          </p>
          {aboutParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="deck-view__text">
              {paragraph}
            </p>
          ))}
        </>
      ),
    },
    {
      id: 'experience',
      label: 'Experience',
      content: (
        <>
          <h2 className="deck-view__heading">Experience</h2>
          <ul className="deck-view__cards">
            {experienceItems.slice(0, 4).map((job) => (
              <li key={job.company} className="deck-view__card">
                <strong>{job.role}</strong> — {job.company}
                <span>{job.date}</span>
              </li>
            ))}
          </ul>
          {experienceItems.length > 4 && (
            <p className="deck-view__note">+ {experienceItems.length - 4} more roles</p>
          )}
        </>
      ),
    },
    {
      id: 'education',
      label: 'Education',
      content: (
        <>
          <h2 className="deck-view__heading">Education</h2>
          <ul className="deck-view__cards">
            {educationItems.map((school) => (
              <li key={school.school} className="deck-view__card">
                <strong>{school.school}</strong>
                <span>{school.degree}</span>
                <span>{school.date}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      content: (
        <>
          <h2 className="deck-view__heading">Featured Projects</h2>
          <ul className="deck-view__cards">
            {projects.slice(0, 3).map((project) => (
              <li key={project.title} className="deck-view__card">
                <strong>{project.title}</strong>
                <span>{project.meta}</span>
                <span>{project.tags.join(' · ')}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: 'skills',
      label: 'Skills',
      content: (
        <>
          <h2 className="deck-view__heading">Skills</h2>
          <div className="deck-view__skill-grid">
            {skillsGroups.map((group) => (
              <div key={group.label} className="deck-view__skill-group">
                <h3>{group.label}</h3>
                <p>{group.items.join(' · ')}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      content: (
        <>
          <h2 className="deck-view__heading">Get in Touch</h2>
          <p className="deck-view__lead">Open to opportunities and collaborations.</p>
          <ul className="deck-view__contact-list">
            <li>
              <a href={`mailto:${portfolioMeta.email}`}>{portfolioMeta.email}</a>
            </li>
            <li>
              <a href={`mailto:${portfolioMeta.schoolEmail}`}>{portfolioMeta.schoolEmail}</a>
            </li>
            <li>
              <a href={`tel:${portfolioMeta.phone.replace(/-/g, '')}`}>{portfolioMeta.phone}</a>
            </li>
          </ul>
          <p className="deck-view__links">
            <a href={portfolioMeta.resumePath} target="_blank" rel="noopener noreferrer">
              Download resume
            </a>
          </p>
        </>
      ),
    },
  ];
}

const SLIDES = buildSlides();

export function DeckView() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const total = SLIDES.length;

  const go = useCallback((next: number) => {
    setIndex(Math.min(total - 1, Math.max(0, next)));
  }, [total]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        go(index + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(index - 1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        go(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        go(total - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [go, index, total]);

  return (
    <div className="deck-view">
      <AlternateViewHeader title="Presentation" subtitle={`Slide ${index + 1} / ${total}`} />
      <div className="deck-view__stage">
        <article className="deck-view__slide" aria-live="polite">
          {slide.content}
        </article>
        <div className="deck-view__controls">
          <button
            type="button"
            className="deck-view__nav-btn"
            disabled={index === 0}
            onClick={() => go(index - 1)}
          >
            Previous
          </button>
          <div className="deck-view__dots" role="tablist" aria-label="Slides">
            {SLIDES.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                className={`deck-view__dot${i === index ? ' is-active' : ''}`}
                aria-selected={i === index}
                aria-label={item.label}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="deck-view__nav-btn"
            disabled={index === total - 1}
            onClick={() => go(index + 1)}
          >
            Next
          </button>
        </div>
        <p className="deck-view__hint">← → or Space to navigate</p>
      </div>
    </div>
  );
}
