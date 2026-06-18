import { useUiMode } from '../context/UiModeContext';

export function ViewUnlockModal() {
  const { pendingUnlock, resolveUnlock, alternateViewsEnabled } = useUiMode();

  if (!pendingUnlock) return null;

  return (
    <div className="view-unlock" role="dialog" aria-modal="true" aria-labelledby="view-unlock-title">
      <div className="view-unlock__backdrop" aria-hidden onClick={() => resolveUnlock(false)} />
      <div className="view-unlock__dialog">
        <p className="view-unlock__badge">Achievement unlocked</p>
        <h2 className="view-unlock__title" id="view-unlock-title">
          {pendingUnlock.achievementTitle}
        </h2>
        <p className="view-unlock__text">{pendingUnlock.achievementDescription}</p>
        <p className="view-unlock__hint">
          {alternateViewsEnabled ? (
            <>
              <strong>{pendingUnlock.label}</strong> is now in the navigation bar. Use the
              preferences icon there anytime to set your default view.
            </>
          ) : (
            <>
              <strong>{pendingUnlock.label}</strong> is unlocked for desktop. Open this site on a
              larger screen to explore it and switch views from the navigation bar.
            </>
          )}
        </p>
        <div className="view-unlock__actions">
          <button type="button" className="btn btn--primary" onClick={() => resolveUnlock(false)}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
