'use client';

import cn from 'classnames';
import { useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import SSR from '../components/ssr';
import REPL, { REPLContext } from '../components/repl';
import useTheme from '../hooks/useTheme';

import Header from './header';

export default function HomePage() {
  const [theme, setTheme] = useTheme('dark');

  const [playground, setPlayground] = useLocalStorageState<
    REPLContext['playground']
  >('playground', {
    defaultValue: 'js',
  });
  const [maximizeREPL, setMaximizeREPL] = useLocalStorageState('maximized', {
    defaultValue: false,
  });
  const [autoRun, setAutoRun] = useLocalStorageState('autorun', {
    defaultValue: true,
  });

  const [replContainer, setREPLContainer] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <div className="h-full text-sm">
      <div
        className={cn(
          'h-full bg-[linear-gradient(to_top,#ffffff_0%,#dfe9f3_100%)] flex flex-col',
          'dark:bg-[linear-gradient(to_top,#0077c0_0%,#000000_100%)]',
        )}
      >
        <REPLContext.Provider
          value={{
            theme,
            setTheme,
            playground,
            setPlayground,
            maximizeREPL,
            setMaximizeREPL,
            autoRun,
            setAutoRun,
          }}
        >
          <Header />

          <SSR cloak>
            <div className="relative flex-one">
              <hgroup className="absolute top-10 inset-x-0 text-center flex flex-col items-center">
                <h1
                  className={cn(
                    'px-4 py-1 text-3xl tracking-wide bg-gradient-to-r from-[#2fafff] to-[#737373] bg-clip-text text-transparent',
                    'dark:from-[#00ecbc] dark:to-[#2fafff]',
                  )}
                >
                  JavaScript Playground
                </h1>
                <h2 className="mt-2 tracking-wide text-[#4d4d4d] dark:text-white">
                  A no-fuss JavaScript playground with instant feedback.
                </h2>
              </hgroup>

              <div
                ref={(ref) => setREPLContainer(ref)}
                className="relative flex flex-col justify-center items-center w-full h-full"
              >
                <REPL container={replContainer} />
              </div>
            </div>
          </SSR>
        </REPLContext.Provider>
      </div>
    </div>
  );
}
