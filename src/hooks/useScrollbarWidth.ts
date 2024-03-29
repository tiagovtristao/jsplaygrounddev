import { useState, useEffect } from 'react';

export default function useScrollbarWidth(): number {
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  useEffect(() => {
    setScrollbarWidth(window.innerWidth - document.documentElement.clientWidth);
  }, []);

  return scrollbarWidth;
}
