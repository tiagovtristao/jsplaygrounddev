import { useState, useEffect, useCallback } from 'react';

import throttle from '../utils/throttle';

type Coords =
  | { x: number; y?: undefined }
  | { x?: undefined; y: number }
  | { x: number; y: number };

export default function useResizer<T extends Coords>(
  container: HTMLElement | null,
  coords: T,
): [{ x: T['x']; y: T['y'] }, boolean, () => void] {
  const [x, setX] = useState(coords.x);
  const [y, setY] = useState(coords.y);
  const [resizing, setResizing] = useState(false);

  const resizingEnabled = container && resizing;
  const startResizing = useCallback(() => setResizing(true), [setResizing]);

  useEffect(() => {
    if (resizingEnabled) {
      const stopResizing = () => setResizing(false);

      document.addEventListener('mouseup', stopResizing, true);
      document.addEventListener('touchend', stopResizing, true);

      return () => {
        document.removeEventListener('mouseup', stopResizing, true);
        document.removeEventListener('touchend', stopResizing, true);
      };
    }
  }, [resizingEnabled]);

  useEffect(() => {
    if (resizingEnabled) {
      const userSelect = window.getComputedStyle(document.body).userSelect;
      document.body.style.userSelect = 'none';

      return () => {
        document.body.style.userSelect = userSelect;
      };
    }
  }, [resizingEnabled]);

  // TODO: The `throttle` calls keep getting reset given that the coords
  // are part of the dependencies and change during resizing.
  useEffect(() => {
    if (resizingEnabled) {
      const [mouseResize, mouseThrottleCancel] = throttle(
        (event: MouseEvent) => {
          const domRect = container.getBoundingClientRect();

          if (x !== undefined) {
            setX((event.clientX - domRect.left) / domRect.width);
          }

          if (y !== undefined) {
            setY((event.clientY - domRect.top) / domRect.height);
          }
        },
      );

      const [touchResize, touchThrottleCancel] = throttle(
        (event: TouchEvent) => {
          event.preventDefault();
          event.stopPropagation();

          const domRect = container.getBoundingClientRect();

          if (x !== undefined) {
            setX((event.touches[0].clientX - domRect.left) / domRect.width);
          }

          if (y !== undefined) {
            setY((event.touches[0].clientY - domRect.top) / domRect.height);
          }
        },
      );

      document.addEventListener('mousemove', mouseResize, true);
      document.addEventListener('touchmove', touchResize, {
        capture: true,
        passive: false,
      });

      return () => {
        mouseThrottleCancel();
        document.removeEventListener('mousemove', mouseResize, true);

        touchThrottleCancel();
        document.removeEventListener('touchmove', touchResize, true);
      };
    }
  }, [resizingEnabled, container, x, setX, y, setY]);

  return [{ x, y }, resizing, startResizing];
}
