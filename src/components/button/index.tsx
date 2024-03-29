import {
  type ReactNode,
  type ComponentProps,
  type KeyboardEvent,
  type ElementType,
} from 'react';

interface Props extends ComponentProps<ElementType> {
  as?: ElementType;
  children?: ReactNode;
  onClick: () => void;
}

export default function Button({
  as: Element = 'div',
  onClick,
  ...rest
}: Props) {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Enter') {
      onClick();
    }
  };

  const props = { ...rest, role: 'button', tabIndex: 0, onKeyDown, onClick };

  return <Element {...props} />;
}
