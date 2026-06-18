import { useEffect, useState } from 'react';

/** Matches `$bp-md-up` — alternate views are desktop/tablet landscape only. */
const DESKTOP_VIEWS_QUERY = '(min-width: 769px)';

export function useAlternateViewsEnabled(): boolean {
  const [enabled, setEnabled] = useState(
    () => window.matchMedia(DESKTOP_VIEWS_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_VIEWS_QUERY);
    const onChange = () => setEnabled(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return enabled;
}
