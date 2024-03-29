import { useRef, useEffect } from 'react';

export default function usePrevious<T>(value: T) {
  const valueRef = useRef<T | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  return valueRef.current;
}
