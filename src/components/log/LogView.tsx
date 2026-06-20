import { useState } from 'react';
import { getGitLog } from '../../data/portfolioContent';
import { AlternateViewHeader } from '../views/AlternateViewHeader';

export function LogView() {
  const commits = getGitLog();
  const [expanded, setExpanded] = useState<string | null>(commits[0]?.hash ?? null);

  return (
    <div className="log-view">
      <AlternateViewHeader title="git log" subtitle="lucasthiessen/portfolio" />
      <div className="log-view__body">
        <p className="log-view__branch">
          <span className="log-view__branch-label">branch</span> main
        </p>
        <ol className="log-view__list">
          {commits.map((commit) => {
            const isOpen = expanded === commit.hash;
            return (
              <li key={commit.hash} className="log-view__item">
                <button
                  type="button"
                  className={`log-view__commit${isOpen ? ' is-open' : ''}`}
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : commit.hash)}
                >
                  <span className="log-view__graph" aria-hidden>
                    ●
                  </span>
                  <span className="log-view__meta">
                    <span className="log-view__hash">{commit.hash}</span>
                    <span className="log-view__date">{commit.date}</span>
                  </span>
                  <span className="log-view__title">{commit.title}</span>
                  <span className="log-view__tags">
                    {commit.tags.map((tag) => (
                      <span key={tag} className="log-view__tag">
                        {tag}
                      </span>
                    ))}
                  </span>
                </button>
                {isOpen && (
                  <div className="log-view__detail">
                    <ul>
                      {commit.body.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
