import { type ReactNode, useState, useEffect } from 'react';

export default function SSR({
  cloak,
  children,
}:
  | {
      cloak: true;
      children: ReactNode;
    }
  | {
      cloak: false;
      children: (isSSR: boolean) => ReactNode;
    }) {
  const [ssr, setSSR] = useState(true);

  useEffect(() => {
    if (ssr) {
      setSSR(false);
    }
  }, [ssr, setSSR]);

  if (!cloak) {
    return children(ssr);
  }

  return ssr ? null : children;
}
