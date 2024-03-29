import { useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export default function useTheme(value: 'light' | 'dark') {
  const [theme, setTheme] = useLocalStorageState('theme', {
    defaultValue: value,
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return [theme, setTheme] as const;
}
