import { SectionTitle } from './SectionTitle';
import { scrollToSelector } from '../../utils/scroll';

type AboutSectionProps = {
  variant?: 'page' | 'modal';
};

export function AboutSection({ variant = 'page' }: AboutSectionProps) {
  const year = new Date().getFullYear();
  const age = year - 2001;

  const inner = (
    <>
      {variant === 'page' && <SectionTitle number="01">About Me</SectionTitle>}
      <div className="about__grid reveal">
        <div className="about__photo">
          <img
            src="/images/profile_pic.jpg"
            alt="Portrait of Lucas Thiessen"
            width={280}
            height={280}
          />
        </div>
        <div className="about__content">
          <ul className="about__stats">
            <li className="about__stat">University of Waterloo</li>
            <li className="about__stat">Computer Engineering</li>
            <li className="about__stat">Age {age}</li>
          </ul>
          <p className="about__text">
            I&apos;m a computer engineering graduate from the University of Waterloo with
            experience in C++, embedded systems, robotics, and full-stack development.
            I&apos;ve worked across multiple tech roles, building everything from autonomous
            robots and FPGA processors to PHP/JavaScript web platforms and AI-powered features.
          </p>
          <p className="about__text">
            I enjoy solving complex engineering problems, designing intuitive user experiences,
            and creating systems that are fast, reliable, and impactful.
          </p>
          {variant === 'page' && (
            <a
              href="#contact"
              className="btn btn--text"
              onClick={(e) => {
                e.preventDefault();
                scrollToSelector('#contact');
              }}
            >
              Contact me →
            </a>
          )}
        </div>
      </div>
    </>
  );

  if (variant === 'modal') {
    return <div className="container">{inner}</div>;
  }

  return (
    <section className="section" id="about">
      <div className="container">{inner}</div>
    </section>
  );
}
