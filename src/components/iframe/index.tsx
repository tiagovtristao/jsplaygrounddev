import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';

export interface IFrameHandle {
  element: HTMLIFrameElement | null;
  reload: () => void;
}

interface Props {
  name: string;
  width?: string | number;
  height?: string | number;
  title: string;
  content: {
    html: string;
    css: string;
    js: string;
  };
  preScript?: string;
  disabled?: boolean;
}

const IFrame = forwardRef<IFrameHandle, Props>(
  (
    {
      name,
      width = 'auto',
      height = 'auto',
      title,
      content: { html, css, js },
      preScript,
      disabled = false,
    },
    ref,
  ) => {
    const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
    const [objectURL, setObjectURL] = useState('');
    const previousObjectURLRef = useRef<string | null>(null);

    useEffect(() => {
      if (!disabled) {
        const document = renderDocument(html, css, js, {
          preScript,
        });
        const url = URL.createObjectURL(
          new Blob([document], { type: 'text/html' }),
        );

        setObjectURL(url);
      }
    }, [disabled, html, css, js, preScript, setObjectURL]);

    useEffect(() => {
      if (previousObjectURLRef.current) {
        URL.revokeObjectURL(previousObjectURLRef.current);
      }

      previousObjectURLRef.current = objectURL;
    }, [objectURL]);

    useImperativeHandle(
      ref,
      () => {
        return {
          element: iframe,
          reload: () => {
            const document = renderDocument(html, css, js, {
              preScript,
            });
            const url = URL.createObjectURL(
              new Blob([document], { type: 'text/html' }),
            );
            setObjectURL(url);
          },
        };
      },
      [iframe, html, css, js, preScript, setObjectURL],
    );

    return (
      <iframe
        className="bg-white text-black"
        ref={(iframe) => setIframe(iframe)}
        title={title}
        name={name}
        src={objectURL}
        width={width}
        height={height}
      />
    );
  },
);

IFrame.displayName = 'IFrame';

export default IFrame;

function renderDocument(
  html: string,
  css: string,
  js: string,
  hooks: { preScript?: string } = {},
): string {
  const style = `<style>${css}</style>`;
  const script =
    `<script>window.onerror = function (e) { console.error(e); };</script>` +
    `<script>document.addEventListener("DOMContentLoaded", function () { ${js}; });</script>`;

  if (/<head>[\s\S]*<\/head>/.test(html)) {
    if (hooks.preScript) {
      const pos = html.search('<head>') + '<head>'.length;

      html =
        html.substring(0, pos) +
        `<script>${hooks.preScript}</script>` +
        html.substring(pos);
    }

    const pos = html.search('</head>');

    html = html.substring(0, pos) + style + script + html.substring(pos);
  } else {
    html = style + script + html;

    if (hooks.preScript) {
      html = `<script>${hooks.preScript}</script>` + html;
    }
  }

  if (!/^[\s]*<!.+?>/.test(html)) {
    html = `<!DOCTYPE html>\n${html}`;
  }

  return html;
}
