import { type ReactElement, cloneElement, useEffect, useRef } from 'react';
import cn from 'classnames';

import useResizer from '../../hooks/useResizer';
import fractionStringifier from '../../utils/fractionStringifier';

interface Props {
  className?: string;
  left: ReactElement;
  right: ReactElement;
  sliderPositionFraction?: number;
  disabled?: boolean;
}

export default function ResizableDualPanel({
  className,
  left: leftPanel,
  right: rightPanel,
  sliderPositionFraction = 0.5,
  disabled = false,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [{ x }, isResizing, startResizing] = useResizer(container?.current, {
    x: sliderPositionFraction,
  });

  const newSliderPositionFraction = Math.max(0, Math.min(x, 1));

  return (
    <div ref={container} className={cn(className, 'flex')}>
      <div
        className="flex-one flex"
        style={{
          flexBasis: fractionStringifier(newSliderPositionFraction),
        }}
      >
        {cloneElement(leftPanel, {
          ...leftPanel.props,
          className: cn(leftPanel.props.className, 'flex-one'),
        })}
      </div>

      <span
        className={cn(
          'cursor-col-resize px-1 -mx-1 isolate flex',
          'before:border-l before:border-[#cccccc] dark:before:border-[#30363d]',
          { 'after:fixed after:inset-0': isResizing },
        )}
        {...(!disabled && {
          onMouseDown: startResizing,
          onTouchStart: startResizing,
        })}
      />

      <div
        className="flex-one flex"
        style={{
          flexBasis: fractionStringifier(1 - newSliderPositionFraction),
        }}
      >
        {cloneElement(rightPanel, {
          ...rightPanel.props,
          className: cn(rightPanel.props.className, 'flex-one'),
        })}
      </div>
    </div>
  );
}
