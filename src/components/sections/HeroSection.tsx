import { GitHubIcon, LinkedInIcon } from '../icons/SocialIcons';
import { siteConfig } from '../../config/site';
import { useHeroTagline } from '../../hooks/useHeroTagline';
import { scrollToSelector } from '../../utils/scroll';

type HeroSectionProps = {
  variant?: 'page' | 'modal';
};

function HeroInitials() {
  return (
    <div className="hero__initials" aria-hidden="true">
      <span className="hero__initials-text">LT</span>
    </div>
  );
}

function HeroPhoto({ placement }: { placement: 'mobile' | 'desktop' }) {
  const { profileDisplay, profileImage } = siteConfig;
  const useInitials = profileDisplay === 'initials';

  return (
    <div className={`hero__visual hero__visual--${placement} reveal is-visible`}>
      <div className="hero__photo-frame">
        {useInitials ? (
          <HeroInitials />
        ) : (
          <img
            src={profileImage.src}
            alt="Portrait of Lucas Thiessen"
            width={profileImage.width}
            height={profileImage.height}
            fetchPriority={placement === 'desktop' ? 'high' : undefined}
          />
        )}
      </div>
    </div>
  );
}

export function HeroSection({ variant = 'page' }: HeroSectionProps) {
  const { role, isAnimating } = useHeroTagline();
  const isModal = variant === 'modal';
  const { profileDisplay } = siteConfig;
  const showPortrait = profileDisplay === 'photo' || profileDisplay === 'initials';
  const isCentered = profileDisplay === 'none' && !isModal;

  const content = (
    <div className="hero__content reveal is-visible">
      {!isModal && showPortrait && <HeroPhoto placement="mobile" />}
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
    <section
      className={`hero${isCentered ? ' hero--centered' : ''}`}
      id="hero"
    >
      <div className="hero__bg" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__orb hero__orb--1" aria-hidden="true" />
      <div className="hero__orb hero__orb--2" aria-hidden="true" />
      <div className="hero__inner container">
        <div className="hero__layout">
          {content}
          {!isModal && showPortrait && <HeroPhoto placement="desktop" />}
        </div>
      </div>
    </section>
  );
}
