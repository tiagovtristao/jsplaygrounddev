import { ConsoleFeedGlobalVariables } from './constants';

export function iframeGlueScriptConstructor(siteUrl: string): string {
  const args = JSON.stringify([
    siteUrl,
    ConsoleFeedGlobalVariables.HOOK,
    ConsoleFeedGlobalVariables.ENCODE,
  ]).slice(1, -1);

  return `(${iframeGlueScript.toString()})(${args});`;
}

function iframeGlueScript(
  siteUrl: string,
  globalHook: string,
  globalEncode: string,
) {
  // Send any console messages on this window to the parent
  window.parent[globalHook](
    console,
    (log: any) => {
      window.parent.postMessage(
        {
          type: 'console:message',
          message: log,
        },
        siteUrl,
      );
    },
    true,
  );

  // Tell the parent that console message events are ready to be sent
  window.parent.postMessage({ type: 'console:init' }, siteUrl);

  // Process any command sent by parent and returns its result
  window.addEventListener('message', (event) => {
    try {
      if (event.origin === siteUrl && event.data?.type === 'console:command') {
        const result = (0, eval)(event.data.command);

        window.parent.postMessage(
          {
            type: 'console:message',
            message: window.parent[globalEncode]({
              method: 'result',
              data: [result],
            }),
          },
          siteUrl,
        );
      }
    } catch (e) {
      console.error(e);
    }
  });
}
