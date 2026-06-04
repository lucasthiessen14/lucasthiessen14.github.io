import { GitHubIcon, LinkedInIcon } from '../icons/SocialIcons';
import { useHeroTagline } from '../../hooks/useHeroTagline';
import { scrollToSelector } from '../../utils/scroll';

type HeroSectionProps = {
  variant?: 'page' | 'modal';
};

export function HeroSection({ variant = 'page' }: HeroSectionProps) {
  const { role, isAnimating } = useHeroTagline();
  const isModal = variant === 'modal';

  const content = (
    <div className="hero__content reveal is-visible">
      <div className="hero__badge">
        <span className="hero__badge-dot" aria-hidden="true" />
        Open to opportunities
      </div>
      <p className="hero__greeting">Hello, I&apos;m</p>
      <h1 className="hero__title">
        <span className="hero__title-line">Lucas</span>
        <span className="hero__title-line hero__title-line--accent">Thiessen</span>
      </h1>
      <p className="hero__tagline">
        <span className="hero__tagline-prefix">I&apos;m a </span>
        <span
          id="hero-role"
          className={`hero__role${isAnimating ? ' is-changing' : ''}`}
        >
          {role}
        </span>
      </p>
      <p className="hero__subtitle">
        Building reliable software from embedded systems and robotics to full-stack
        products.
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
      <div className="hero__orb hero__orb--1" aria-hidden="true" />
      <div className="hero__orb hero__orb--2" aria-hidden="true" />
      <div className="hero__inner container">
        <div className="hero__layout">
          {content}
          <div className="hero__visual reveal is-visible">
            <div className="hero__photo-frame">
              <img
                src="/images/profile_pic.jpg"
                alt="Portrait of Lucas Thiessen"
                width={320}
                height={320}
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
        <a
          href="#about"
          className="hero__scroll"
          aria-label="Scroll to about section"
          onClick={(e) => {
            e.preventDefault();
            scrollToSelector('#about');
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 16.5l-6-6h12l-6 6z"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
