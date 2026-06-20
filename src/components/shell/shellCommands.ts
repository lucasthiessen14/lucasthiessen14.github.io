import {
  aboutParagraphs,
  buildContactMarkdown,
  getPortfolioFile,
  getPortfolioFiles,
  portfolioMeta,
  slugify,
} from '../../data/portfolioContent';
import { educationItems, experienceItems, projects } from '../../data/portfolio';
import { getShellDirectoryEntries } from './shellCompletion';

export type ShellLine = {
  id: string;
  type: 'input' | 'output' | 'error';
  text: string;
  /** Working directory label when the command was entered. */
  prompt?: string;
};

export type ShellCommandResult = {
  lines: ShellLine[];
  cwd?: string;
};

const BANNER = `Lucas Thiessen — portfolio shell v1.0
Type 'help' for commands.`;

const HELP_TEXT = `Available commands:
  help              Show this message
  clear             Clear the screen
  ls [dir]          List files and directories
  cd [dir]          Change directory (~ for home)
  pwd               Print working directory
  cat <file>        Print a file
  whoami            About Lucas
  contact           Contact information
  open <url>        Open a link in a new tab
  view              Switch views (use the menu ↗)`;

export function formatShellPrompt(cwd: string): string {
  return cwd ? `~/${cwd}` : '~';
}

function normalizeShellPath(dir: string): string {
  let path = dir.trim();
  if (path === '.' || path === './' || path === '~' || path === '') return '';
  path = path.replace(/^\.\//, '').replace(/^\//, '').replace(/\/$/, '');
  if (path === '.' || path === '~') return '';
  return path;
}

export function resolveShellPath(cwd: string, target: string): string {
  const trimmed = target.trim();
  if (trimmed === '' || trimmed === '~') return '';
  if (trimmed === '.') return cwd;

  const segments = trimmed.startsWith('/')
    ? trimmed.slice(1).split('/')
    : [...(cwd ? cwd.split('/') : []), ...trimmed.split('/')];

  const stack: string[] = [];
  for (const segment of segments) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      stack.pop();
      continue;
    }
    stack.push(segment);
  }

  return stack.join('/');
}

function isDirectory(path: string): boolean {
  const normalized = normalizeShellPath(path);
  if (!normalized) return getPortfolioFiles().length > 0;
  if (getPortfolioFile(normalized)) return false;
  const prefix = `${normalized}/`;
  return getPortfolioFiles().some((file) => file.path.startsWith(prefix));
}

function listDirectory(dir: string): string[] {
  const normalized = normalizeShellPath(dir);
  const entries = getShellDirectoryEntries(normalized);

  if (entries === null) {
    return [`ls: cannot access '${dir || '~'}': No such directory`];
  }

  return entries.map((entry) => entry.name);
}

function resolveCatPath(arg: string, cwd: string): string | null {
  const fullPath = resolveShellPath(cwd, arg);
  const direct = getPortfolioFile(fullPath);
  if (direct) return direct.path;

  if (arg.includes('/')) return null;

  const key = arg.toLowerCase().replace(/\.md$/, '');
  const aliases: Record<string, string> = {
    readme: 'README.md',
    about: 'about.md',
    skills: 'skills.md',
    contact: 'contact.md',
  };

  if (aliases[key]) return aliases[key];

  for (const job of experienceItems) {
    if (slugify(job.company) === key) return `experience/${slugify(job.company)}.md`;
  }
  for (const school of educationItems) {
    if (slugify(school.school) === key) return `education/${slugify(school.school)}.md`;
  }
  for (const project of projects) {
    if (slugify(project.title) === key) return `projects/${slugify(project.title)}.md`;
  }

  return null;
}

function line(text: string, type: ShellLine['type'] = 'output'): ShellLine {
  return { id: crypto.randomUUID(), type, text };
}

export function runShellCommand(input: string, cwd: string): ShellCommandResult {
  const trimmed = input.trim();
  if (!trimmed) return { lines: [] };

  const [command, ...args] = trimmed.split(/\s+/);
  const cmd = command.toLowerCase();

  switch (cmd) {
    case 'help':
      return { lines: [line(HELP_TEXT)] };
    case 'clear':
      return { lines: [{ id: '__clear__', type: 'output', text: '' }] };
    case 'pwd':
      return { lines: [line(formatShellPrompt(cwd))] };
    case 'whoami':
      return {
        lines: [
          line(`${portfolioMeta.name} — ${portfolioMeta.title}\n${aboutParagraphs[0]}`),
        ],
      };
    case 'contact':
      return { lines: [line(buildContactMarkdown())] };
    case 'ls': {
      const path = args[0] ? resolveShellPath(cwd, args[0]) : cwd;
      return {
        lines: listDirectory(path).map((text) => line(text)),
      };
    }
    case 'cd': {
      const target = args[0] ?? '~';
      const next = resolveShellPath(cwd, target);
      if (!isDirectory(next)) {
        return {
          lines: [line(`cd: ${target}: No such directory`, 'error')],
        };
      }
      return { lines: [], cwd: next };
    }
    case 'cat': {
      if (!args[0]) {
        return { lines: [line('cat: missing file operand', 'error')] };
      }
      const path = resolveCatPath(args[0], cwd);
      if (!path) {
        return { lines: [line(`cat: ${args[0]}: No such file`, 'error')] };
      }
      const file = getPortfolioFile(path);
      return { lines: [line(file?.content ?? '')] };
    }
    case 'open': {
      const url = args[0];
      if (!url) {
        return { lines: [line('open: missing URL', 'error')] };
      }
      const href =
        url === 'github'
          ? portfolioMeta.github
          : url === 'linkedin'
            ? portfolioMeta.linkedin
            : url === 'resume'
              ? portfolioMeta.resumePath
              : url.startsWith('http') || url.startsWith('/')
                ? url
                : `https://${url}`;
      window.open(href, '_blank', 'noopener,noreferrer');
      return { lines: [line(`Opened ${href}`)] };
    }
    case 'view':
      return {
        lines: [
          line('Use the view menu in the top-right corner to switch presentation modes.'),
        ],
      };
    default:
      return {
        lines: [
          line(`${command}: command not found. Type 'help' for available commands.`, 'error'),
        ],
      };
  }
}

export function getShellBanner(): ShellLine[] {
  return [
    { id: 'banner', type: 'output', text: BANNER },
    {
      id: 'hint',
      type: 'output',
      text: `Try: ls · cd education · cat about · open github`,
    },
  ];
}
