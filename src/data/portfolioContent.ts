import {
  educationItems,
  experienceItems,
  projects,
  skillsGroups,
} from './portfolio';

export const portfolioMeta = {
  name: 'Lucas Thiessen',
  title: 'Computer Engineering Graduate',
  subtitle:
    'Building reliable software from embedded systems and robotics to full-stack products.',
  github: 'https://github.com/lucasthiessen14',
  linkedin: 'https://www.linkedin.com/in/lucasthiessen14',
  email: 'lucasthiessen14@gmail.com',
  schoolEmail: 'lucas.thiessen@uwaterloo.ca',
  phone: '226-970-2402',
  resumePath: '/files/Resume.pdf',
} as const;

export const aboutParagraphs = [
  "I'm a computer engineering graduate from the University of Waterloo with experience in C++, embedded systems, robotics, and full-stack development. I've worked across multiple tech roles, building everything from autonomous robots and FPGA processors to PHP/JavaScript web platforms and AI-powered features.",
  'I enjoy solving complex engineering problems, designing intuitive user experiences, and creating systems that are fast, reliable, and impactful.',
] as const;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getAge(birthYear = 2001): number {
  return new Date().getFullYear() - birthYear;
}

export function buildReadme(): string {
  return `# ${portfolioMeta.name}

${portfolioMeta.title}

${portfolioMeta.subtitle}

## Links

- GitHub: ${portfolioMeta.github}
- LinkedIn: ${portfolioMeta.linkedin}
- Email: ${portfolioMeta.email}
- Resume: ${portfolioMeta.resumePath}
`;
}

export function buildAboutMarkdown(): string {
  const age = getAge();
  return `# About Me

University of Waterloo · Computer Engineering · Age ${age}

${aboutParagraphs.join('\n\n')}
`;
}

export function buildExperienceMarkdown(
  company: string,
  role: string,
  date: string,
  bullets: string[],
): string {
  return `# ${role} @ ${company}

_${date}_

${bullets.map((b) => `- ${b}`).join('\n')}
`;
}

export function buildEducationMarkdown(
  school: string,
  date: string,
  degree: string,
  detail: string,
): string {
  return `# ${school}

_${date}_

**${degree}**

${detail}
`;
}

export function buildProjectMarkdown(
  title: string,
  meta: string,
  tags: string[],
  bullets: string[],
): string {
  return `# ${title}

_${meta}_

Tags: ${tags.join(', ')}

${bullets.map((b) => `- ${b}`).join('\n')}
`;
}

export function buildSkillsMarkdown(): string {
  return skillsGroups
    .map((group) => `## ${group.label}\n\n${group.items.join(', ')}`)
    .join('\n\n');
}

export function buildContactMarkdown(): string {
  return `# Contact

Open to opportunities and collaborations.

- Personal: ${portfolioMeta.email}
- School: ${portfolioMeta.schoolEmail}
- Phone: ${portfolioMeta.phone}
- GitHub: ${portfolioMeta.github}
- LinkedIn: ${portfolioMeta.linkedin}
`;
}

export type PortfolioFile = {
  path: string;
  name: string;
  content: string;
  language: string;
};

export function getPortfolioFiles(): PortfolioFile[] {
  const files: PortfolioFile[] = [
    { path: 'README.md', name: 'README.md', content: buildReadme(), language: 'markdown' },
    { path: 'about.md', name: 'about.md', content: buildAboutMarkdown(), language: 'markdown' },
    {
      path: 'skills.md',
      name: 'skills.md',
      content: `# Skills\n\n${buildSkillsMarkdown()}`,
      language: 'markdown',
    },
    {
      path: 'contact.md',
      name: 'contact.md',
      content: buildContactMarkdown(),
      language: 'markdown',
    },
  ];

  for (const job of experienceItems) {
    const name = `${slugify(job.company)}.md`;
    files.push({
      path: `experience/${name}`,
      name,
      content: buildExperienceMarkdown(job.company, job.role, job.date, job.bullets),
      language: 'markdown',
    });
  }

  for (const school of educationItems) {
    const name = `${slugify(school.school)}.md`;
    files.push({
      path: `education/${name}`,
      name,
      content: buildEducationMarkdown(school.school, school.date, school.degree, school.detail),
      language: 'markdown',
    });
  }

  for (const project of projects) {
    const name = `${slugify(project.title)}.md`;
    files.push({
      path: `projects/${name}`,
      name,
      content: buildProjectMarkdown(project.title, project.meta, project.tags, project.bullets),
      language: 'markdown',
    });
  }

  return files;
}

export function getPortfolioFile(path: string): PortfolioFile | undefined {
  const normalized = path.replace(/^\.\//, '').replace(/^\//, '');
  return getPortfolioFiles().find((file) => file.path === normalized);
}

export type GitCommit = {
  hash: string;
  date: string;
  title: string;
  body: string[];
  tags: string[];
};

export function getGitLog(): GitCommit[] {
  const commits: GitCommit[] = [];
  let index = 0;

  const addCommit = (date: string, title: string, body: string[], tags: string[]) => {
    const hash = (index++).toString(16).padStart(7, '0');
    commits.push({ hash, date, title, body, tags });
  };

  addCommit('2025-04-01', 'graduate: B.A.Sc. Computer Engineering', [...aboutParagraphs], [
    'education',
    'milestone',
  ]);

  for (const job of experienceItems) {
    addCommit(
      job.date.split('–')[0]?.trim() ?? job.date,
      `feat(${slugify(job.company)}): ${job.role}`,
      job.bullets,
      ['experience', slugify(job.company)],
    );
  }

  for (const school of educationItems) {
    addCommit(
      school.date.split('–')[0]?.trim() ?? school.date,
      `docs(${slugify(school.school)}): ${school.degree}`,
      [school.detail],
      ['education'],
    );
  }

  for (const project of projects) {
    addCommit(
      project.meta.split('·')[1]?.trim() ?? '2024',
      `project: ${project.title}`,
      project.bullets,
      ['project', ...project.tags.map((t) => slugify(t))],
    );
  }

  addCommit('2026-01-01', 'chore: portfolio site v2', [portfolioMeta.subtitle], ['meta']);

  return commits;
}
