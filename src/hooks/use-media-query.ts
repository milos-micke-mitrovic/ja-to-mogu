import { useState, useEffect, useCallback } from 'react';

export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((mediaQuery: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== 'undefined') {
      return window.matchMedia(mediaQuery).matches;
    }
    return false;
  }, []);

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const handleChange = () => {
      setMatches(mediaQueryList.matches);
    };

    // Set initial value
    handleChange();

    // Add listener
    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
