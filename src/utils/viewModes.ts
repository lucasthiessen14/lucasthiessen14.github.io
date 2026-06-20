import type { ViewId } from '../types/views';

/** Views that use the classic nav, footer, scroll spy, and theme toggle. */
export function isClassicView(mode: ViewId): boolean {
  return mode === 'classic';
}

/** Views that hide the main nav and use their own chrome. */
export function isStandaloneView(mode: ViewId): boolean {
  return !isClassicView(mode) && mode !== 'game';
}

/** Force light document theme (plain HTML). */
export function isLightForcedView(mode: ViewId): boolean {
  return mode === 'plain';
}

/** Force dark document theme. */
export function isDarkForcedView(mode: ViewId): boolean {
  return mode === 'game' || mode === 'shell' || mode === 'log' || mode === 'deck' || mode === 'ide';
}
