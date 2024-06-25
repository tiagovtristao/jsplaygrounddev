import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { githubLightInit, githubDarkInit } from '@uiw/codemirror-theme-github';

import cn from 'classnames';
import { type ComponentProps } from 'react';
import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';

interface Props extends ComponentProps<typeof CodeMirror> {
  className?: string;
  theme?: 'light' | 'dark';
  onChange: (value: string) => void;
  formatCode?: (updateCursorPosition?: () => void) => void;
}

export default function CodeMirrorWrapper({
  className,
  theme = 'dark',
  onChange,
  formatCode,
  extensions = [],
  ...rest
}: Props) {
  const themeExtension = theme === 'dark' ? githubDarkInit : githubLightInit;

  return (
    <CodeMirror
      className={cn(
        className,
        'flex',
        '[&_.cm-editor]:flex-one',
        '[&_.cm-scroller]:flex-one',
        // Remove gutter's border
        '[&_.cm-gutters]:border-r-0',
        // Override background colour
        '[&_.cm-gutters]:bg-inherit',
        // Remove outline
        '[&_.cm-focused]:outline-none',
      )}
      onChange={(value, viewUpdate) => {
        if (viewUpdate.docChanged) {
          onChange(value);
        }
      }}
      theme={{
        extension: themeExtension({
          settings: {
            background: 'inherit',
          },
        }),
      }}
      basicSetup={{
        autocompletion: false,
      }}
      extensions={[
        ...extensions,
        Prec.high(
          keymap.of([
            {
              key: 'Ctrl-Enter',
              run: () => true,
            },
            {
              key: 'Alt-Shift-f',
              run: (view) => {
                const cursorPosition = view.state.selection.main.head;
                formatCode?.(() => {
                  try {
                    const line = view.state.doc.lineAt(cursorPosition);
                    view.dispatch({
                      selection: {
                        anchor: line.to,
                        head: line.to,
                      },
                      scrollIntoView: true,
                    });
                  } catch {}
                });
                return true;
              },
            },
          ]),
        ),
        EditorView.lineWrapping,
      ]}
      autoFocus
      {...rest}
    />
  );
}
