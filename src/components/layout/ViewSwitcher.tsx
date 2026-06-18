import { useUiMode } from '../../context/UiModeContext';
import { ViewMenu } from '../views/ViewMenu';

export function ViewSwitcher() {
  const { unlockedViews, alternateViewsEnabled } = useUiMode();

  if (!alternateViewsEnabled || unlockedViews.length <= 1) return null;

  return <ViewMenu variant="nav" />;
}
