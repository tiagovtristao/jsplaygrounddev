import { css as cmCSS } from '@codemirror/lang-css';
import { html as cmHTML } from '@codemirror/lang-html';
import { javascript as cmJS } from '@codemirror/lang-javascript';

import cn from 'classnames';
import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { AiOutlineSync } from 'react-icons/ai';
import { FiCode } from 'react-icons/fi';
import { AiOutlineClear } from 'react-icons/ai';
import { FiTrash2 } from 'react-icons/fi';
import { FiPlay } from 'react-icons/fi';

import Button from '../button';
import CodeMirrorWrapper from '../codemirror-wrapper';
import Console, { iframeGlueScriptConstructor } from '../console';
import IFrame, { IFrameHandle } from '../iframe';
import ResizableChildContainer from '../resizable-child-container';
import ResizableDualPanel from '../resizable-dual-panel';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '../tabs';

import { defaultHTML, defaultCSS, defaultJS } from './constants';
import jsValidator from './js-validator';
import useCallbackState from '../../hooks/useCallbackState';
import * as prettier from 'prettier';
import * as parserHTML from 'prettier/parser-html';
import * as parserCSS from 'prettier/parser-postcss';
import * as parserJS from 'prettier/parser-babel';
import * as babelPlugin from 'prettier/plugins/babel';
import * as estreePlugin from 'prettier/plugins/estree';

export interface REPLContext {
  theme: 'light' | 'dark';
  setTheme: (
    value: this['theme'] | ((previousValue: this['theme']) => this['theme']),
  ) => void;
  playground: 'js' | 'web';
  setPlayground: (value: this['playground']) => void;
  maximizeREPL: boolean;
  setMaximizeREPL: (value: boolean) => void;
  autoRun: boolean;
  setAutoRun: (value: boolean | ((previousValue: boolean) => boolean)) => void;
}

export const REPLContext = createContext<REPLContext | null>(null);

const playgrounds = {
  js: {
    left: {
      items: {
        html: false,
        css: false,
        js: true,
      },
      active: 'js',
    },
    right: {
      items: {
        output: false,
        console: true,
      },
      active: 'console',
    },
  },
  web: {
    left: {
      items: {
        html: true,
        css: true,
        js: true,
      },
      active: 'html',
    },
    right: {
      items: {
        output: true,
        console: true,
      },
      active: 'output',
    },
  },
};

type Playgrounds = typeof playgrounds;

interface Props {
  container: HTMLDivElement | null;
}

export default function REPL({ container }: Props) {
  const { theme, playground, maximizeREPL, autoRun, setAutoRun } =
    useContext(REPLContext)!;
  const [tabs, dispatch] = useReducer(reducer, playgrounds[playground]);
  const [html, setHTML] = useCallbackState<string>('');
  const [css, setCSS] = useCallbackState<string>('');
  const [js, setJS] = useCallbackState<string>('');

  useEffect(() => {
    setHTML(localStorage.getItem('html') || '');
    setCSS(localStorage.getItem('css') || '');
    setJS(localStorage.getItem('js') || '');
  }, []);

  useEffect(() => {
    dispatch({
      type: 'CHANGE_PLAYGROUND',
      playground: playgrounds[playground],
    });
  }, [playground]);

  const outputRef = useRef<IFrameHandle>(null);

  const consoleFeedIframeGlueScript = useMemo(
    () => iframeGlueScriptConstructor(process.env.NEXT_PUBLIC_SITE_URL!),
    [],
  );

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      // Control + Enter to run
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        outputRef.current!.reload();
      }
      // Alt + A to toggle auto-run
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setAutoRun((value) => !value);
      }

      // Alt + L to clear code
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        setAndSave('html', '');
        setAndSave('css', '');
        setAndSave('js', '');
      }
    };

    window.addEventListener('keydown', listener);

    return () => {
      window.removeEventListener('keydown', listener);
    };
  }, []);

  const formatJS = async (updateCursorPosition?: () => void) => {
    const formattedJS = await prettier.format(js, {
      parser: 'babel',
      plugins: [babelPlugin, estreePlugin, parserJS],
    });
    setJS(formattedJS, () => updateCursorPosition?.());
    setAndSave('js', formattedJS);
  };

  const formatHTML = async (updateCursorPosition?: () => void) => {
    const formattedHTML = await prettier.format(html, {
      parser: 'html',
      plugins: [parserHTML],
    });
    setHTML(formattedHTML, () => updateCursorPosition?.());
    setAndSave('html', formattedHTML);
  };

  const formatCSS = async (updateCursorPosition?: () => void) => {
    const formattedCSS = await prettier.format(css, {
      parser: 'css',
      plugins: [parserCSS],
    });
    setCSS(formattedCSS, () => updateCursorPosition?.());
    setAndSave('css', formattedCSS);
  };

  const setAndSave = (key: 'html' | 'css' | 'js', value: string) => {
    localStorage.setItem(key, value);
    switch (key) {
      case 'html':
        setHTML(value);
        break;
      case 'css':
        setCSS(value);
        break;
      case 'js':
        setJS(value);
        break;
    }
  };

  const content = useMemo(() => {
    if (!html && !css && !js) {
      const html = localStorage.getItem('html');
      const css = localStorage.getItem('css');
      const js = localStorage.getItem('js');

      return {
        html: html || defaultHTML,
        css: css || defaultCSS,
        js: (js && jsValidator(js)) || defaultJS,
      };
    }

    return { html, css, js: jsValidator(js) };
  }, [html, css, js]);

  return (
    <ResizableChildContainer
      className={(isSm) =>
        cn('bg-[#ffffff] flex flex-col dark:bg-[#161b22]', {
          'rounded border border-[#cccccc] dark:border-[#30363d]':
            isSm && !maximizeREPL,
        })
      }
      parent={container}
      widthFraction={0.8}
      heightFraction={0.8}
      maximize={maximizeREPL}
      transformWidthChange={(value) => 2 * value - 1}
      transformHeightChange={(value) => 2 * value - 1}
    >
      {(isSm) => (
        <ResizableDualPanel
          className={cn('flex-one', {
            'flex-col': !isSm,
            'flex-row': isSm,
          })}
          sliderPositionFraction={0.5}
          disabled={!isSm}
          left={
            <Tabs
              activeTab={tabs.left.active}
              onTabClick={(id) =>
                dispatch({ type: 'ACTIVATE_TAB', group: 'left', id })
              }
            >
              <TabList
                className="border-b border-[#cccccc] dark:border-[#30363d]"
                right={
                  <>
                    <Button
                      title="Clear Code (Alt + L)"
                      as={AiOutlineClear}
                      className="text-xl text-[#0076cf] dark:text-[#2fafff]"
                      onClick={() => {
                        setAndSave('html', '');
                        setAndSave('css', '');
                        setAndSave('js', '');
                      }}
                    />
                    <Button
                      title="Format Code (Alt + Shift + F)"
                      as={FiCode}
                      className="text-xl text-[#0076cf] dark:text-[#2fafff]"
                      onClick={() => {
                        formatHTML();
                        formatCSS();
                        formatJS();
                      }}
                    />
                    <Button
                      title={
                        autoRun
                          ? 'Disable auto-run (Alt + A)'
                          : 'Enable auto-run (Alt + A)'
                      }
                      as={AiOutlineSync}
                      className={cn('text-xl', {
                        'text-[#0076cf] dark:text-[#2fafff]': autoRun,
                        'text-[#a1a1a1] dark:text-[#7d8590]': !autoRun,
                      })}
                      onClick={() => setAutoRun((value) => !value)}
                    />
                    <Button
                      title={
                        autoRun ? 'Re-run (Ctrl + Enter)' : 'Run (Ctrl + Enter)'
                      }
                      as={FiPlay}
                      className="text-xl text-[#0076cf] dark:text-[#2fafff]"
                      onClick={() => outputRef.current!.reload()}
                    />
                  </>
                }
              >
                <Tab id="html" hidden={!tabs.left.items.html}>
                  HTML
                </Tab>
                <Tab id="css" hidden={!tabs.left.items.css}>
                  CSS
                </Tab>
                <Tab id="js" hidden={!tabs.left.items.js}>
                  JavaScript
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel id="html">
                  <CodeMirrorWrapper
                    className="flex-one w-full"
                    theme={theme}
                    formatCode={formatHTML}
                    extensions={[cmHTML()]}
                    value={html}
                    onChange={(value) => setAndSave('html', value)}
                  />
                </TabPanel>
                <TabPanel id="css">
                  <CodeMirrorWrapper
                    className="flex-one w-full"
                    theme={theme}
                    formatCode={formatCSS}
                    extensions={[cmCSS()]}
                    value={css}
                    onChange={(value) => setAndSave('css', value)}
                  />
                </TabPanel>
                <TabPanel id="js">
                  <CodeMirrorWrapper
                    className="flex-one w-full"
                    theme={theme}
                    formatCode={formatJS}
                    extensions={[cmJS()]}
                    value={js}
                    onChange={(value) => setAndSave('js', value)}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          }
          right={
            <Tabs
              activeTab={tabs.right.active}
              onTabClick={(id) =>
                dispatch({ type: 'ACTIVATE_TAB', group: 'right', id })
              }
            >
              <TabList
                className={cn(
                  'border-b border-[#cccccc] dark:border-[#30363d]',
                  {
                    'border-t': !isSm,
                  },
                )}
              >
                <Tab id="output" hidden={!tabs.right.items.output}>
                  Output
                </Tab>
                <Tab id="console" hidden={!tabs.right.items.console}>
                  Console
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel id="output">
                  <IFrame
                    ref={outputRef}
                    name="output"
                    width="100%"
                    title="Output"
                    content={content}
                    preScript={consoleFeedIframeGlueScript}
                    disabled={!autoRun}
                  />
                </TabPanel>
                <TabPanel id="console">
                  <Console
                    className="flex-one"
                    theme={theme}
                    iframe={outputRef.current!?.element}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          }
        />
      )}
    </ResizableChildContainer>
  );
}

function reducer<T extends Playgrounds['js'] | Playgrounds['web']>(
  state: T,
  action:
    | { type: 'CHANGE_PLAYGROUND'; playground: T }
    | { type: 'ACTIVATE_TAB'; group: 'left' | 'right'; id: string },
) {
  switch (action.type) {
    case 'CHANGE_PLAYGROUND': {
      return action.playground;
    }
    case 'ACTIVATE_TAB': {
      return {
        ...state,
        [action.group]: { ...state[action.group], active: action.id },
      };
    }
    default: {
      return state;
    }
  }
}
