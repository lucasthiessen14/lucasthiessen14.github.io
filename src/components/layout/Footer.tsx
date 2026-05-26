import { GitHubIcon, LinkedInIcon } from '../icons/SocialIcons';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer site-footer--classic">
      <div className="site-footer__inner">
        <p className="site-footer__copy">© {year} Lucas Thiessen</p>
        <ul className="site-footer__social">
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
    </footer>
  );
}
