import type { ViewId } from '../types/views';

export type DiscoverableView = {
  id: Exclude<ViewId, 'classic'>;
  /** URL search param name, e.g. `view` in `?view=adventure` */
  urlParam: string;
  /** Required param value to unlock this view */
  urlValue: string;
  label: string;
  achievementTitle: string;
  achievementDescription: string;
};

/** Views that are always available without discovery. */
export const BASE_VIEWS: ViewId[] = ['classic'];

/**
 * Hidden views unlocked via URL parameters.
 * Add new entries here to create additional discoverable experiences.
 */
export const DISCOVERABLE_VIEWS: DiscoverableView[] = [
  {
    id: 'game',
    urlParam: 'view',
    urlValue: 'adventure',
    label: 'Adventure Map',
    achievementTitle: 'Pathfinder',
    achievementDescription:
      'You discovered the adventure map — explore the portfolio as an interactive maze.',
  },
  {
    id: 'plain',
    urlParam: 'view',
    urlValue: 'plain',
    label: 'Plain',
    achievementTitle: 'Source View',
    achievementDescription:
      'You found the plain HTML version of this site — just tags and browser defaults.',
  },
  {
    id: 'shell',
    urlParam: 'view',
    urlValue: 'shell',
    label: 'Terminal',
    achievementTitle: 'Root Access',
    achievementDescription:
      'You opened a shell on this portfolio — try ls, cat about, and open github.',
  },
  {
    id: 'log',
    urlParam: 'view',
    urlValue: 'log',
    label: 'Git Log',
    achievementTitle: 'Commit Archaeologist',
    achievementDescription:
      'You traced the git history of this career — every role and project as a commit.',
  },
  {
    id: 'deck',
    urlParam: 'view',
    urlValue: 'deck',
    label: 'Slides',
    achievementTitle: 'Presenter Mode',
    achievementDescription:
      'You entered slide deck mode — arrow keys navigate the portfolio presentation.',
  },
  {
    id: 'ide',
    urlParam: 'view',
    urlValue: 'ide',
    label: 'IDE',
    achievementTitle: 'Workspace Unlocked',
    achievementDescription:
      'You opened the portfolio as a codebase — browse files in the sidebar explorer.',
  },
];

export function findDiscoverableView(params: URLSearchParams): DiscoverableView | null {
  for (const view of DISCOVERABLE_VIEWS) {
    if (params.get(view.urlParam) === view.urlValue) {
      return view;
    }
  }
  return null;
}

export function getViewLabel(id: ViewId): string {
  if (id === 'classic') return 'Classic';
  const discovered = DISCOVERABLE_VIEWS.find((v) => v.id === id);
  return discovered?.label ?? id;
}
