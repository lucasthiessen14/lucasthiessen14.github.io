import type { MouseEvent } from 'react';
import { useUiMode } from '../../context/UiModeContext';
import { getViewLabel } from '../../config/views';
import { useToast } from '../../context/ToastContext';
import { siteConfig } from '../../config/site';
import {
  educationItems,
  experienceItems,
  projects,
  skillsGroups,
} from '../../data/portfolio';
import type { ViewId } from '../../types/views';

const CONTACT_LINKS = [
  { label: 'lucasthiessen14@gmail.com', href: 'mailto:lucasthiessen14@gmail.com' },
  { label: 'lucas.thiessen@uwaterloo.ca', href: 'mailto:lucas.thiessen@uwaterloo.ca' },
  { label: '226-970-2402', href: 'tel:+12269702402' },
] as const;

const SOCIAL_LINKS = [
  { label: 'GitHub', href: 'https://github.com/lucasthiessen14' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lucasthiessen14' },
] as const;

function PlainViewControls() {
  const { mode, setMode, unlockedViews, defaultView, setDefaultView } = useUiMode();
  const { showToast } = useToast();

  if (unlockedViews.length <= 1) return null;

  const onSetDefault = (viewId: ViewId) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setDefaultView(viewId);
    showToast(`${getViewLabel(viewId)} is now your default view.`);
  };

  return (
    <>
      <p>
        View:{' '}
        {unlockedViews.map((id, index) => {
          const label = getViewLabel(id);
          const separator = index < unlockedViews.length - 1 ? ' | ' : null;

          if (mode === id) {
            return (
              <span key={id}>
                <b>{label}</b>
                {separator}
              </span>
            );
          }

          return (
            <span key={id}>
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setMode(id);
                }}
              >
                {label}
              </a>
              {separator}
            </span>
          );
        })}
      </p>
      <p>
        Default view on visit:{' '}
        {unlockedViews.map((id, index) => {
          const label = getViewLabel(id);
          const separator = index < unlockedViews.length - 1 ? ' | ' : null;

          if (defaultView === id) {
            return (
              <span key={id}>
                <b>{label}</b>
                {separator}
              </span>
            );
          }

          return (
            <span key={id}>
              <a href="#" onClick={onSetDefault(id)}>
                {label}
              </a>
              {separator}
            </span>
          );
        })}
      </p>
    </>
  );
}

export function PlainSite() {
  const year = new Date().getFullYear();
  const age = year - 2001;

  return (
    <main className="plain-site">
      <h1>Lucas Thiessen</h1>
      <p>
        <i>Computer Engineering Graduate</i>
      </p>
      <p>
        Building reliable software from embedded systems and robotics to full-stack products.
      </p>
      <p>
        <a href="/files/Resume.pdf">Download my resume</a>
      </p>
      <p>
        <a href="https://github.com/lucasthiessen14">GitHub</a> |{' '}
        <a href="https://www.linkedin.com/in/lucasthiessen14">LinkedIn</a>
      </p>

      <p>
        <a href="#about">About</a> | <a href="#experience">Experience</a> |{' '}
        <a href="#education">Education</a> | <a href="#projects">Projects</a> |{' '}
        <a href="#skills">Skills</a> | <a href="#contact">Contact</a>
      </p>

      <hr />

      <h2 id="about">About Me</h2>
      <p>
        <img
          src={siteConfig.profileImage.src}
          alt="Portrait of Lucas Thiessen"
          width={siteConfig.profileImage.width}
          height={siteConfig.profileImage.height}
        />
      </p>
      <p>
        University of Waterloo · Computer Engineering · Age {age}
      </p>
      <p>
        I&apos;m a computer engineering graduate from the University of Waterloo with experience
        in C++, embedded systems, robotics, and full-stack development. I&apos;ve worked across
        multiple tech roles, building everything from autonomous robots and FPGA processors to
        PHP/JavaScript web platforms and AI-powered features.
      </p>
      <p>
        I enjoy solving complex engineering problems, designing intuitive user experiences, and
        creating systems that are fast, reliable, and impactful.
      </p>
      <p>
        <a href="#contact">Contact me</a>
      </p>

      <hr />

      <h2 id="experience">Experience</h2>
      {experienceItems.map((job) => (
        <div key={`${job.company}-${job.date}`}>
          <h3>
            {job.role} at {job.company}
          </h3>
          <p>
            <i>{job.date}</i>
          </p>
          <ul>
            {job.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}

      <hr />

      <h2 id="education">Education</h2>
      {educationItems.map((school) => (
        <div key={school.school}>
          <h3>{school.school}</h3>
          <p>
            <i>{school.date}</i>
          </p>
          <p>
            <b>{school.degree}</b>
          </p>
          <p>{school.detail}</p>
        </div>
      ))}

      <hr />

      <h2 id="projects">Projects</h2>
      {projects.map((project) => (
        <div key={project.title}>
          <h3>{project.title}</h3>
          <p>
            <i>{project.meta}</i>
          </p>
          <p>{project.tags.join(', ')}</p>
          <ul>
            {project.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}

      <hr />

      <h2 id="skills">Skills</h2>
      {skillsGroups.map((group) => (
        <div key={group.label}>
          <h3>{group.label}</h3>
          <p>{group.items.join(', ')}</p>
        </div>
      ))}

      <hr />

      <h2 id="contact">Contact</h2>
      <p>Open to opportunities and collaborations.</p>
      <address>
        {CONTACT_LINKS.map((item) => (
          <span key={item.href}>
            <a href={item.href}>{item.label}</a>
            <br />
          </span>
        ))}
      </address>
      <p>
        {SOCIAL_LINKS.map((link, index) => (
          <span key={link.href}>
            <a href={link.href}>{link.label}</a>
            {index < SOCIAL_LINKS.length - 1 ? ' | ' : null}
          </span>
        ))}
      </p>

      <hr />

      <p>
        <small>Last updated: {year}</small>
      </p>
      <p>
        <small>Copyright {year} Lucas Thiessen</small>
      </p>
      <PlainViewControls />
    </main>
  );
}
