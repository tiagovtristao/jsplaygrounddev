import { css as cmCSS } from '@codemirror/lang-css';
import { html as cmHTML } from '@codemirror/lang-html';
import { javascript as cmJS } from '@codemirror/lang-javascript';

import cn from 'classnames';
import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { AiOutlineSync } from 'react-icons/ai';
import { FiDownload, FiPlay } from 'react-icons/fi';

import Button from '../button';
import CodeMirrorWrapper from '../codemirror-wrapper';
import Console, { iframeGlueScriptConstructor } from '../console';
import IFrame, { IFrameHandle } from '../iframe';
import ResizableChildContainer from '../resizable-child-container';
import ResizableDualPanel from '../resizable-dual-panel';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '../tabs';

import { defaultHTML, defaultCSS, defaultJS } from './constants';
import jsValidator from './js-validator';
import { exportContent } from './exportContent';

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

  const [html, setHTML] = useState<string>('');
  const [css, setCSS] = useState<string>('');
  const [js, setJS] = useState<string>('');

  const content = useMemo(() => {
    if (!html && !css && !js) {
      return { html: defaultHTML, css: defaultCSS, js: defaultJS };
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
                      title="Export"
                      as={FiDownload}
                      className="text-xl text-[#0076cf] dark:text-[#2fafff]"
                      onClick={() => exportContent(content)}
                    />
                    <Button
                      title={autoRun ? 'Disable auto-run' : 'Enable auto-run'}
                      as={AiOutlineSync}
                      className={cn('text-xl', {
                        'text-[#0076cf] dark:text-[#2fafff]': autoRun,
                        'text-[#a1a1a1] dark:text-[#7d8590]': !autoRun,
                      })}
                      onClick={() => setAutoRun((value) => !value)}
                    />
                    <Button
                      title={autoRun ? 'Re-run' : 'Run'}
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
                    extensions={[cmHTML()]}
                    value={html}
                    onChange={(value) => setHTML(value)}
                  />
                </TabPanel>
                <TabPanel id="css">
                  <CodeMirrorWrapper
                    className="flex-one w-full"
                    theme={theme}
                    extensions={[cmCSS()]}
                    onChange={(value) => setCSS(value)}
                  />
                </TabPanel>
                <TabPanel id="js">
                  <CodeMirrorWrapper
                    className="flex-one w-full"
                    theme={theme}
                    extensions={[cmJS()]}
                    onChange={(value) => setJS(value)}
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
