import { GitHubIcon, LinkedInIcon } from '../icons/SocialIcons';
import { useHeroTagline } from '../../hooks/useHeroTagline';
import { scrollToSelector } from '../../utils/scroll';

type HeroSectionProps = {
  variant?: 'page' | 'modal';
};

export function HeroSection({ variant = 'page' }: HeroSectionProps) {
  const role = useHeroTagline();
  const isModal = variant === 'modal';

  const content = (
    <div className="hero__content reveal is-visible">
      <p className="hero__greeting">Hello, I&apos;m</p>
      <h1 className="hero__title">Lucas Thiessen</h1>
      <p className="hero__tagline">
        <span id="hero-role">{role}</span>
      </p>
      <div className="hero__cta">
        <a
          href="/files/Resume.pdf"
          className="btn btn--primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Resume
        </a>
        {!isModal && (
          <a
            href="#contact"
            className="btn btn--ghost"
            onClick={(e) => {
              e.preventDefault();
              scrollToSelector('#contact');
            }}
          >
            Get in Touch
          </a>
        )}
      </div>
      <ul className="hero__social">
        <li>
          <a
            href="https://github.com/lucasthiessen14"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>
        </li>
        <li>
          <a
            href="https://www.linkedin.com/in/lucasthiessen14"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
        </li>
      </ul>
    </div>
  );

  if (isModal) return content;

  return (
    <section className="hero" id="hero">
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />
      {content}
    </section>
  );
}
