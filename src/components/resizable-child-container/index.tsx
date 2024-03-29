import cn from 'classnames';
import { type ReactNode } from 'react';
import { GrBottomCorner } from 'react-icons/gr';

import useResizer from '../../hooks/useResizer';
import useScrollbarWidth from '../../hooks/useScrollbarWidth';
import useTailwindBreakpoint from '../../hooks/useTailwindBreakpoint';
import fractionStringifier from '../../utils/fractionStringifier';

interface Props {
  children: (isSm: boolean) => ReactNode;
  className?: string | ((isSm: boolean) => string);
  parent: HTMLElement | null;
  widthFraction?: number;
  heightFraction?: number;
  maximize?: boolean;
  transformWidthChange?: (value: number) => number;
  transformHeightChange?: (value: number) => number;
}

export default function ResizableChildContainer({
  children,
  className,
  parent,
  widthFraction = 0.5,
  heightFraction = 0.5,
  maximize = false,
  transformWidthChange = (value) => value,
  transformHeightChange = (value) => value,
}: Props) {
  const [{ x, y }, isResizing, startResizing] = useResizer(parent, {
    x: widthFraction,
    y: heightFraction,
  });

  const { matches: isSm, breakpoint } = useTailwindBreakpoint('sm');
  const scrollbarWidth = useScrollbarWidth();

  const newWidthFraction = maximize
    ? 1
    : Math.max(0, Math.min(transformWidthChange(x), 1));
  const newHeightFraction = maximize
    ? 1
    : Math.max(0, Math.min(transformHeightChange(y), 1));

  const { width, height } = isSm
    ? {
        // We need to account for the scrollbar width in order to avoid potential horizontal overflow
        width: `min(100%, max(calc(${breakpoint} - ${scrollbarWidth}px), ${fractionStringifier(
          newWidthFraction,
        )}))`,
        // The 16/9 is the aspect ratio used to set a limit to the container's height
        // based on the small breakpoint (also used as a limit to the container's width)
        height: `min(100%, max(calc(${breakpoint} * 9/16), ${fractionStringifier(
          newHeightFraction,
        )}))`,
      }
    : { width: '100%', height: '100%' };

  const classNames =
    typeof className === 'string' ? className : className?.(isSm);

  return (
    <div className={cn(classNames, 'relative')} style={{ width, height }}>
      {children(isSm)}

      {isSm && (
        <div
          className={cn(
            'absolute cursor-nwse-resize right-[1px] bottom-[1px]',
            {
              'after:fixed after:inset-0': isResizing,
            },
          )}
          onMouseDown={startResizing}
          onTouchStart={startResizing}
        >
          <GrBottomCorner className="[&_polyline]:stroke-[#6a6a6a] w-2.5 h-2.5" />
        </div>
      )}
    </div>
  );
}
