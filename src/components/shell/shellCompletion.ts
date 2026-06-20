import { getPortfolioFile, getPortfolioFiles, slugify } from '../../data/portfolioContent';
import { educationItems, experienceItems, projects } from '../../data/portfolio';
import { resolveShellPath } from './shellCommands';

const COMMANDS = [
  'help',
  'clear',
  'ls',
  'cd',
  'pwd',
  'cat',
  'whoami',
  'contact',
  'open',
  'view',
] as const;

const OPEN_TARGETS = ['github', 'linkedin', 'resume'] as const;

const ROOT_CAT_ALIASES = ['readme', 'about', 'skills', 'contact'] as const;

export type ShellDirEntry = {
  name: string;
  isDir: boolean;
};

export type ShellCompletionContext =
  | { kind: 'command'; partial: string }
  | { kind: 'path'; command: string; argPartial: string; filter: 'dirs' | 'files' | 'all' }
  | { kind: 'open'; argPartial: string }
  | { kind: 'none' };

export type TabCycleState = {
  /** Input up to (not including) the token being completed. */
  beforePartial: string;
  matches: string[];
  index: number;
};

const ARG_COMMANDS = new Set(['ls', 'cd', 'cat', 'open']);

function isExactArgCommand(token: string): boolean {
  return ARG_COMMANDS.has(token.toLowerCase());
}

function getCycleAnchor(input: string, context: ShellCompletionContext): string {
  const leading = input.match(/^\s*/)?.[0] ?? '';
  const trimmed = input.trimStart();
  const spaceIdx = trimmed.indexOf(' ');

  if (context.kind === 'path') {
    const command = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    const slashIdx = context.argPartial.lastIndexOf('/');
    const pathPrefix = slashIdx === -1 ? '' : context.argPartial.slice(0, slashIdx + 1);
    return `${leading}${command} ${pathPrefix}`;
  }

  if (context.kind === 'open') {
    const command = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
    return `${leading}${command} `;
  }

  return leading;
}

function isCycleContinuation(input: string, cycle: TabCycleState): boolean {
  if (!input.startsWith(cycle.beforePartial)) return false;
  const suffix = input.slice(cycle.beforePartial.length);
  if (suffix === '') return true;
  return cycle.matches.some((match) => match === suffix || match.startsWith(suffix));
}

function splitInputToken(
  input: string,
  context: ShellCompletionContext,
): { beforePartial: string; partial: string } {
  const leading = input.match(/^\s*/)?.[0] ?? '';
  const trimmed = input.trimStart();
  const spaceIdx = trimmed.indexOf(' ');

  if (spaceIdx === -1) {
    if (context.kind === 'path' || context.kind === 'open') {
      const argPartial = context.kind === 'path' ? context.argPartial : context.argPartial;
      const slashIdx = argPartial.lastIndexOf('/');
      const pathPrefix = slashIdx === -1 ? '' : argPartial.slice(0, slashIdx + 1);
      const partial = slashIdx === -1 ? argPartial : argPartial.slice(slashIdx + 1);
      return { beforePartial: `${leading}${trimmed} ${pathPrefix}`, partial };
    }
    return { beforePartial: leading, partial: trimmed };
  }

  const command = trimmed.slice(0, spaceIdx);
  const argPartial = trimmed.slice(spaceIdx + 1);
  const slashIdx = argPartial.lastIndexOf('/');
  const pathPrefix = slashIdx === -1 ? '' : argPartial.slice(0, slashIdx + 1);
  const partial = slashIdx === -1 ? argPartial : argPartial.slice(slashIdx + 1);

  return { beforePartial: `${leading}${command} ${pathPrefix}`, partial };
}

export function parseShellInputForCompletion(input: string): ShellCompletionContext {
  const trimmed = input.trimStart();
  if (!trimmed) return { kind: 'command', partial: '' };

  const spaceIdx = trimmed.indexOf(' ');
  if (spaceIdx === -1) {
    const token = trimmed;
    const command = token.toLowerCase();
    if (isExactArgCommand(token)) {
      if (command === 'open') {
        return { kind: 'open', argPartial: '' };
      }
      const filter = command === 'cd' ? 'dirs' : command === 'cat' ? 'files' : 'all';
      return { kind: 'path', command, argPartial: '', filter };
    }
    return { kind: 'command', partial: token };
  }

  const command = trimmed.slice(0, spaceIdx).toLowerCase();
  const argPartial = trimmed.slice(spaceIdx + 1);

  if (command === 'ls' || command === 'cd' || command === 'cat') {
    const filter = command === 'cd' ? 'dirs' : command === 'cat' ? 'files' : 'all';
    return { kind: 'path', command, argPartial, filter };
  }

  if (command === 'open') {
    return { kind: 'open', argPartial };
  }

  return { kind: 'none' };
}

export function getShellDirectoryEntries(dir: string): ShellDirEntry[] | null {
  const normalized = dir.replace(/^\.\//, '').replace(/^\//, '').replace(/\/$/, '');
  if (normalized === '.' || normalized === '~') {
    return getShellDirectoryEntries('');
  }

  const prefix = normalized ? `${normalized}/` : '';
  const entries = new Map<string, ShellDirEntry>();

  for (const file of getPortfolioFiles()) {
    if (normalized) {
      if (!file.path.startsWith(prefix)) continue;
    }
    const rest = normalized ? file.path.slice(prefix.length) : file.path;
    const slash = rest.indexOf('/');
    if (slash === -1) {
      entries.set(rest, { name: rest, isDir: false });
    } else {
      const dirName = rest.slice(0, slash + 1);
      entries.set(dirName, { name: dirName, isDir: true });
    }
  }

  if (entries.size === 0) {
    if (!normalized) return [];
    if (getPortfolioFile(normalized)) return null;
    return null;
  }

  return [...entries.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function rootCatAliasMatches(prefix: string): string[] {
  const matches: string[] = ROOT_CAT_ALIASES.filter((alias) => alias.startsWith(prefix));
  for (const job of experienceItems) {
    const slug = slugify(job.company);
    if (slug.startsWith(prefix) && !matches.includes(slug)) matches.push(slug);
  }
  for (const school of educationItems) {
    const slug = slugify(school.school);
    if (slug.startsWith(prefix) && !matches.includes(slug)) matches.push(slug);
  }
  for (const project of projects) {
    const slug = slugify(project.title);
    if (slug.startsWith(prefix) && !matches.includes(slug)) matches.push(slug);
  }
  return matches.sort();
}

export function getPathCompletions(
  argPartial: string,
  cwd: string,
  filter: 'dirs' | 'files' | 'all',
): string[] {
  const slashIdx = argPartial.lastIndexOf('/');
  const dirPart = slashIdx === -1 ? '' : argPartial.slice(0, slashIdx + 1);
  const namePrefix = slashIdx === -1 ? argPartial : argPartial.slice(slashIdx + 1);

  const baseDir = dirPart ? resolveShellPath(cwd, dirPart) : cwd;
  const entries = getShellDirectoryEntries(baseDir);
  if (entries === null) return [];

  const matches = new Set<string>();

  for (const entry of entries) {
    if (filter === 'dirs' && !entry.isDir) continue;
    if (filter === 'files' && entry.isDir) continue;
    if (!entry.name.startsWith(namePrefix)) continue;
    matches.add(dirPart + entry.name);
  }

  if (filter !== 'dirs' && !dirPart && namePrefix.length > 0) {
    for (const alias of rootCatAliasMatches(namePrefix)) {
      matches.add(alias);
    }
  }

  return [...matches].sort();
}

export function getShellCompletions(input: string, cwd: string): string[] {
  const context = parseShellInputForCompletion(input);

  switch (context.kind) {
    case 'command':
      return COMMANDS.filter((cmd) => cmd.startsWith(context.partial.toLowerCase()));
    case 'path':
      return getPathCompletions(context.argPartial, cwd, context.filter);
    case 'open':
      return OPEN_TARGETS.filter((target) => target.startsWith(context.argPartial.toLowerCase()));
    default:
      return [];
  }
}

function longestCommonPrefix(values: string[]): string {
  if (values.length === 0) return '';
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (!prefix) return '';
    }
  }
  return prefix;
}

export function replaceShellInputToken(input: string, replacement: string): string {
  const context = parseShellInputForCompletion(input);
  const { beforePartial } = splitInputToken(input, context);
  return beforePartial + replacement;
}

function completionSuffix(value: string, context: ShellCompletionContext): string {
  if (context.kind === 'command' || context.kind === 'open') {
    return ' ';
  }

  if (context.kind === 'path') {
    if (value.endsWith('/')) return '';
    if (context.command === 'cd') return '/';
    if (context.command === 'ls') return value.endsWith('/') ? '' : ' ';
    return ' ';
  }

  return '';
}

export function applyShellTabCompletion(
  input: string,
  cwd: string,
  cycle: TabCycleState | null,
): { input: string; cycle: TabCycleState | null } {
  const context = parseShellInputForCompletion(input);

  if (cycle && isCycleContinuation(input, cycle)) {
    const currentSuffix = input.slice(cycle.beforePartial.length);
    const currentIndex = cycle.matches.findIndex((match) => match === currentSuffix);
    const nextIndex = ((currentIndex >= 0 ? currentIndex : cycle.index) + 1) % cycle.matches.length;
    const next = cycle.matches[nextIndex];
    return {
      input: cycle.beforePartial + next,
      cycle: { beforePartial: cycle.beforePartial, matches: cycle.matches, index: nextIndex },
    };
  }

  const matches = getShellCompletions(input, cwd);

  if (matches.length === 0) {
    return { input, cycle: null };
  }

  const { partial } = splitInputToken(input, context);
  const anchor = getCycleAnchor(input, context);

  const commonPrefix = longestCommonPrefix(matches);

  if (partial.length > 0 && commonPrefix.length > partial.length) {
    const filtered = matches.filter((match) => match.startsWith(commonPrefix));
    const suffix = filtered.length === 1 ? completionSuffix(filtered[0], context) : '';
    return {
      input: anchor + commonPrefix + suffix,
      cycle:
        filtered.length > 1
          ? { beforePartial: anchor, matches: filtered, index: 0 }
          : null,
    };
  }

  if (matches.length === 1) {
    const match = matches[0];
    return {
      input: anchor + match + completionSuffix(match, context),
      cycle: null,
    };
  }

  return {
    input: anchor + matches[0],
    cycle: { beforePartial: anchor, matches, index: 0 },
  };
}
