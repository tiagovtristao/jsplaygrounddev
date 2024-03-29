import { useState, useEffect } from 'react';
import resolveConfig from 'tailwindcss/resolveConfig';

import twConfig from '../../tailwind.config';

const { screens } = resolveConfig(twConfig).theme;

export default function useTailwindBreakpoint(key: keyof typeof screens) {
  const mediaQuery = `(min-width: ${screens[key]})`;

  const [matches, setMatches] = useState(true);

  useEffect(() => {
    setMatches(window.matchMedia(mediaQuery).matches);
  }, [mediaQuery]);

  useEffect(() => {
    const queryList = window.matchMedia(mediaQuery);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    queryList.addEventListener('change', listener);

    return () => {
      queryList.removeEventListener('change', listener);
    };
  }, [mediaQuery, setMatches]);

  return { matches, breakpoint: screens[key] };
}
